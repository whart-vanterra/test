import { NextRequest } from 'next/server';
import { authenticateUser, generateToken } from '@/lib/admin-auth';
import { loginSchema } from '@/lib/validation';
import { loginRateLimit } from '@/lib/rate-limiter';
import { rateLimitMiddleware } from '@/lib/rate-limiter';
import { handleError, createSuccessResponse } from '@/lib/error-handler';
import { trackAdminLogin } from '@/lib/gtm';

export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResponse = await rateLimitMiddleware(request, loginRateLimit);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    const body = await request.json();
    const validatedData = loginSchema.parse(body);

    const user = await authenticateUser(validatedData.email, validatedData.password);

    if (!user) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Invalid email or password',
        }),
        { 
          status: 401, 
          headers: { 'Content-Type': 'application/json' } 
        }
      );
    }

    const token = generateToken(user);

    // Set HTTP-only cookie
    const response = createSuccessResponse({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });

    response.cookies.set('admin-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60, // 24 hours
      path: '/',
    });

    // Track login event (server-side)
    // Note: GTM tracking would typically be done client-side
    // This is a placeholder for server-side analytics if needed

    return response;
  } catch (error) {
    return handleError(error);
  }
}
