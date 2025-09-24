import { NextRequest } from 'next/server';
import { getCurrentUser } from '@/lib/admin-auth';
import { handleError, createSuccessResponse } from '@/lib/error-handler';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);

    if (!user) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Not authenticated',
        }),
        { 
          status: 401, 
          headers: { 'Content-Type': 'application/json' } 
        }
      );
    }

    return createSuccessResponse({ user });
  } catch (error) {
    return handleError(error);
  }
}
