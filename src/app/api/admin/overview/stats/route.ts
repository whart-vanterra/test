import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/admin-auth';
import { getDashboardStats } from '@/lib/admin-queries';
import { adminApiRateLimit } from '@/lib/rate-limiter';
import { rateLimitMiddleware } from '@/lib/rate-limiter';
import { handleError, createSuccessResponse } from '@/lib/error-handler';

// GET /api/admin/overview/stats - Get dashboard statistics
export const GET = requireAuth(async (request: NextRequest, user) => {
  try {
    const rateLimitResponse = await rateLimitMiddleware(request, adminApiRateLimit);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    const stats = await getDashboardStats();

    return createSuccessResponse({ stats });
  } catch (error) {
    return handleError(error);
  }
});
