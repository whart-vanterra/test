import { NextRequest } from 'next/server';
import { resetPassword } from '@/lib/admin-auth';
import { resetPasswordSchema } from '@/lib/validation';
import { handleError, createSuccessResponse } from '@/lib/error-handler';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = resetPasswordSchema.parse(body);

    const success = await resetPassword(validatedData.token, validatedData.password);

    if (!success) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Invalid or expired reset token',
        }),
        { 
          status: 400, 
          headers: { 'Content-Type': 'application/json' } 
        }
      );
    }

    return createSuccessResponse({
      message: 'Password reset successfully',
    });
  } catch (error) {
    return handleError(error);
  }
}
