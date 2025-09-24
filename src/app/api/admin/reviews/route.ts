import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/admin-auth';
import { getAllReviews } from '@/lib/admin-queries';
import { adminApiRateLimit } from '@/lib/rate-limiter';
import { rateLimitMiddleware } from '@/lib/rate-limiter';
import { handleError, createSuccessResponse } from '@/lib/error-handler';
import { reviewFiltersSchema } from '@/lib/validation';

// GET /api/admin/reviews - List reviews with pagination and filters
export const GET = requireAuth(async (request: NextRequest, user) => {
  try {
    const rateLimitResponse = await rateLimitMiddleware(request, adminApiRateLimit);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    const { searchParams } = new URL(request.url);
    const filters = {
      page: searchParams.get('page'),
      limit: searchParams.get('limit'),
      search: searchParams.get('search'),
      feedback_type: searchParams.get('feedback_type'),
      location_id: searchParams.get('location_id'),
      brand_id: searchParams.get('brand_id'),
      date_from: searchParams.get('date_from'),
      date_to: searchParams.get('date_to'),
      sortBy: searchParams.get('sortBy'),
      sortOrder: searchParams.get('sortOrder'),
    };

    const validatedFilters = reviewFiltersSchema.parse(filters);
    
    const result = await getAllReviews(
      validatedFilters.page,
      validatedFilters.limit,
      {
        feedback_type: validatedFilters.feedback_type,
        location_id: validatedFilters.location_id,
        brand_id: validatedFilters.brand_id,
        search: validatedFilters.search,
      }
    );

    return createSuccessResponse({
      reviews: result.data,
      pagination: {
        total: result.total,
        page: validatedFilters.page,
        limit: validatedFilters.limit,
        totalPages: Math.ceil(result.total / validatedFilters.limit),
      },
    });
  } catch (error) {
    return handleError(error);
  }
});
