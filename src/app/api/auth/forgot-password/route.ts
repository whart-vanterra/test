import { NextRequest } from 'next/server';
import { generateResetToken } from '@/lib/admin-auth';
import { sendPasswordResetEmail } from '@/lib/email';
import { forgotPasswordSchema } from '@/lib/validation';
import { passwordResetRateLimit } from '@/lib/rate-limiter';
import { rateLimitMiddleware } from '@/lib/rate-limiter';
import { handleError, createSuccessResponse } from '@/lib/error-handler';

export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResponse = await rateLimitMiddleware(request, passwordResetRateLimit);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    const body = await request.json();
    const validatedData = forgotPasswordSchema.parse(body);

    const resetToken = await generateResetToken(validatedData.email);

    if (!resetToken) {
      // Don't reveal if user exists or not for security
      return createSuccessResponse({
        message: 'If an account with that email exists, a password reset link has been sent.',
      });
    }

    // Generate reset URL
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}`;

    // Send password reset email
    await sendPasswordResetEmail(validatedData.email, resetUrl);

    return createSuccessResponse({
      message: 'If an account with that email exists, a password reset link has been sent.',
    });
  } catch (error) {
    return handleError(error);
  }
}
