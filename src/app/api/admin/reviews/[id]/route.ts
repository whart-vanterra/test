import { NextRequest } from 'next/server';
import { createAdminClient } from '@/lib/supabase-server';
import { requireAuth } from '@/lib/admin-auth';
import { adminApiRateLimit } from '@/lib/rate-limiter';
import { rateLimitMiddleware } from '@/lib/rate-limiter';
import { handleError, createSuccessResponse, createErrorResponse } from '@/lib/error-handler';

// DELETE /api/admin/reviews/[id] - Delete review
export const DELETE = requireAuth(async (request: NextRequest, user, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const rateLimitResponse = await rateLimitMiddleware(request, adminApiRateLimit);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    const { id } = await params;
    const supabase = createAdminClient();

    // Check if review exists
    const { data: review, error: fetchError } = await supabase
      .from('reviews_reviews')
      .select('id')
      .eq('id', id)
      .single();

    if (fetchError || !review) {
      return createErrorResponse('Review not found', 404);
    }

    // Delete review (this will cascade delete related negative_feedback records)
    const { error } = await supabase
      .from('reviews_reviews')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete review: ${error.message}`);
    }

    return createSuccessResponse({ message: 'Review deleted successfully' });
  } catch (error) {
    return handleError(error);
  }
});
