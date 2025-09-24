import { NextRequest } from 'next/server';
import { createSuccessResponse } from '@/lib/error-handler';

export async function POST(request: NextRequest) {
  try {
    const response = createSuccessResponse({
      message: 'Logged out successfully',
    });

    // Clear the auth cookie
    response.cookies.set('admin-token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    });

    return response;
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Logout failed',
      }),
      { 
        status: 500, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );
  }
}
