import { NextRequest } from 'next/server';
import { createAdminClient } from '@/lib/supabase-server';
import { createReviewSchema } from '@/lib/validation';
import { reviewSubmissionRateLimit } from '@/lib/rate-limiter';
import { rateLimitMiddleware } from '@/lib/rate-limiter';
import { handleError, createSuccessResponse } from '@/lib/error-handler';
import { getClientIP, getUserAgent } from '@/lib/utils';
import { sendNegativeFeedbackNotification } from '@/lib/email';
import { getBrandById, getLocationById } from '@/lib/admin-queries';

// POST /api/reviews - Submit a customer review
export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResponse = await rateLimitMiddleware(request, reviewSubmissionRateLimit);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    const body = await request.json();
    const validatedData = createReviewSchema.parse(body);

    const supabase = createAdminClient();

    // Get location details
    const location = await getLocationById(validatedData.location_id);
    if (!location) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Location not found',
        }),
        { 
          status: 404, 
          headers: { 'Content-Type': 'application/json' } 
        }
      );
    }

    // Check if location is active
    if (!location.is_active) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'This location is not accepting reviews',
        }),
        { 
          status: 400, 
          headers: { 'Content-Type': 'application/json' } 
        }
      );
    }

    // Get client information
    const ipAddress = getClientIP(request);
    const userAgent = getUserAgent(request);

    // Create review record
    const { data: review, error: reviewError } = await supabase
      .from('reviews_reviews')
      .insert({
        location_id: validatedData.location_id,
        nps_score: validatedData.nps_score,
        customer_name: validatedData.customer_name,
        customer_email: validatedData.customer_email,
        customer_phone: validatedData.customer_phone,
        comments: validatedData.comments,
        feedback_type: validatedData.feedback_type,
        external_review_url: validatedData.external_review_url,
        ip_address: ipAddress,
        user_agent: userAgent,
      })
      .select()
      .single();

    if (reviewError) {
      throw new Error(`Failed to create review: ${reviewError.message}`);
    }

    // Handle negative feedback
    if (validatedData.feedback_type === 'negative') {
      // Create negative feedback record
      const { error: negativeFeedbackError } = await supabase
        .from('reviews_negative_feedback')
        .insert({
          review_id: review.id,
          location_id: validatedData.location_id,
        });

      if (negativeFeedbackError) {
        console.error('Failed to create negative feedback record:', negativeFeedbackError);
      }

      // Send notification email
      try {
        const notificationEmail = location.notification_email || location.brand?.notification_email;
        
        if (notificationEmail && validatedData.customer_name && validatedData.customer_email && validatedData.customer_phone && validatedData.comments) {
          await sendNegativeFeedbackNotification({
            brandName: location.brand?.name || 'Unknown Brand',
            locationName: location.name,
            customerName: validatedData.customer_name,
            customerEmail: validatedData.customer_email,
            customerPhone: validatedData.customer_phone,
            comments: validatedData.comments,
            rating: validatedData.nps_score,
            notificationEmail,
            reviewUrl: `${process.env.NEXT_PUBLIC_APP_URL}/admin`,
          });
        }
      } catch (emailError) {
        console.error('Failed to send notification email:', emailError);
        // Don't fail the review submission if email fails
      }
    }

    return createSuccessResponse({
      review: {
        id: review.id,
        feedback_type: review.feedback_type,
        external_review_url: review.external_review_url,
      },
    });
  } catch (error) {
    return handleError(error);
  }
}
