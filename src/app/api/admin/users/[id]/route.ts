import { NextRequest } from 'next/server';
import { createAdminClient } from '@/lib/supabase-server';
import { requireAuth, requireRole } from '@/lib/admin-auth';
import { updateAdminUserSchema } from '@/lib/validation';
import { adminApiRateLimit } from '@/lib/rate-limiter';
import { rateLimitMiddleware } from '@/lib/rate-limiter';
import { handleError, createSuccessResponse, createErrorResponse } from '@/lib/error-handler';
import { updateAdminUserPassword } from '@/lib/admin-auth';

// PUT /api/admin/users/[id] - Update admin user
export const PUT = requireAuth(async (request: NextRequest, user, { params }: { params: { id: string } }) => {
  try {
    const rateLimitResponse = await rateLimitMiddleware(request, adminApiRateLimit);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    const body = await request.json();
    const validatedData = updateAdminUserSchema.parse({ ...body, id: params.id });

    // Check if user is trying to update their own role (not allowed)
    if (params.id === user.id && validatedData.role && validatedData.role !== user.role) {
      return createErrorResponse('You cannot change your own role', 400);
    }

    // Check if user has permission to update roles
    if (validatedData.role && user.role !== 'super_admin') {
      return createErrorResponse('Only super admins can change user roles', 403);
    }

    // Check password confirmation if password is being updated
    if (validatedData.password && validatedData.password !== body.confirmPassword) {
      return createErrorResponse('Passwords do not match', 400);
    }

    const supabase = createAdminClient();

    // Check if user exists
    const { data: existingUser, error: fetchError } = await supabase
      .from('reviews_admin_users')
      .select('id, email, role')
      .eq('id', params.id)
      .single();

    if (fetchError || !existingUser) {
      return createErrorResponse('User not found', 404);
    }

    // Check if email already exists (excluding current user)
    if (validatedData.email && validatedData.email !== existingUser.email) {
      const { data: emailConflict } = await supabase
        .from('reviews_admin_users')
        .select('id')
        .eq('email', validatedData.email.toLowerCase())
        .neq('id', params.id)
        .single();

      if (emailConflict) {
        return createErrorResponse('A user with this email already exists', 409);
      }
    }

    // Prepare update data
    const updateData: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (validatedData.name) updateData.name = validatedData.name;
    if (validatedData.email) updateData.email = validatedData.email.toLowerCase();
    if (validatedData.role && user.role === 'super_admin') updateData.role = validatedData.role;

    // Update user
    const { data: updatedUser, error } = await supabase
      .from('reviews_admin_users')
      .update(updateData)
      .eq('id', params.id)
      .select('id, email, name, role, is_active, created_at, updated_at')
      .single();

    if (error) {
      throw new Error(`Failed to update user: ${error.message}`);
    }

    // Update password separately if provided
    if (validatedData.password) {
      await updateAdminUserPassword(params.id, validatedData.password);
    }

    return createSuccessResponse({ user: updatedUser });
  } catch (error) {
    return handleError(error);
  }
});

// DELETE /api/admin/users/[id] - Delete admin user
export const DELETE = requireRole('super_admin')(async (request: NextRequest, user, { params }: { params: { id: string } }) => {
  try {
    const rateLimitResponse = await rateLimitMiddleware(request, adminApiRateLimit);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    // Prevent self-deletion
    if (params.id === user.id) {
      return createErrorResponse('You cannot delete your own account', 400);
    }

    const supabase = createAdminClient();

    // Check if user exists
    const { data: existingUser, error: fetchError } = await supabase
      .from('reviews_admin_users')
      .select('id')
      .eq('id', params.id)
      .single();

    if (fetchError || !existingUser) {
      return createErrorResponse('User not found', 404);
    }

    const { error } = await supabase
      .from('reviews_admin_users')
      .delete()
      .eq('id', params.id);

    if (error) {
      throw new Error(`Failed to delete user: ${error.message}`);
    }

    return createSuccessResponse({ message: 'User deleted successfully' });
  } catch (error) {
    return handleError(error);
  }
});
