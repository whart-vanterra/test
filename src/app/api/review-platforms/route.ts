import { NextRequest } from 'next/server';
import { getActiveReviewPlatforms } from '@/lib/admin-queries';
import { handleError, createSuccessResponse } from '@/lib/error-handler';

// GET /api/review-platforms - Get active review platforms
export async function GET(request: NextRequest) {
  try {
    const platforms = await getActiveReviewPlatforms();

    // Only return public data
    const publicPlatforms = platforms.map(platform => ({
      id: platform.id,
      name: platform.name,
      key: platform.key,
      logo_url: platform.logo_url,
      color: platform.color,
      priority: platform.priority,
    }));

    return createSuccessResponse({ platforms: publicPlatforms });
  } catch (error) {
    return handleError(error);
  }
}
