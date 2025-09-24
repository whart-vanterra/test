import { NextRequest } from 'next/server';
import { createAdminClient } from '@/lib/supabase-server';
import { requireAuth, requireRole } from '@/lib/admin-auth';
import { createAdminUserSchema } from '@/lib/validation';
import { adminApiRateLimit } from '@/lib/rate-limiter';
import { rateLimitMiddleware } from '@/lib/rate-limiter';
import { handleError, createSuccessResponse } from '@/lib/error-handler';
import { createAdminUser } from '@/lib/admin-auth';

// GET /api/admin/users - List admin users
export const GET = requireAuth(async (request: NextRequest, user) => {
  try {
    const rateLimitResponse = await rateLimitMiddleware(request, adminApiRateLimit);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    const supabase = createAdminClient();
    
    const { data: users, error } = await supabase
      .from('reviews_admin_users')
      .select('id, email, name, role, is_active, created_at, updated_at')
      .order('name', { ascending: true });

    if (error) {
      throw new Error(`Failed to fetch admin users: ${error.message}`);
    }

    return createSuccessResponse({ users: users || [] });
  } catch (error) {
    return handleError(error);
  }
});

// POST /api/admin/users - Create new admin user
export const POST = requireRole('super_admin')(async (request: NextRequest, user) => {
  try {
    const rateLimitResponse = await rateLimitMiddleware(request, adminApiRateLimit);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    const body = await request.json();
    const validatedData = createAdminUserSchema.parse(body);

    // Check password confirmation if provided
    if (validatedData.password !== (body as { confirmPassword?: string }).confirmPassword) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Passwords do not match',
        }),
        { 
          status: 400, 
          headers: { 'Content-Type': 'application/json' } 
        }
      );
    }

    const newUser = await createAdminUser({
      email: validatedData.email,
      name: validatedData.name,
      password: validatedData.password,
      role: validatedData.role,
    });

    // Return user without password hash
    const { password_hash, ...userWithoutPassword } = newUser;

    return createSuccessResponse({ user: userWithoutPassword });
  } catch (error) {
    return handleError(error);
  }
});
