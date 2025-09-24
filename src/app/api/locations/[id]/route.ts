import { NextRequest } from 'next/server';
import { getLocationById } from '@/lib/admin-queries';
import { handleError, createSuccessResponse, createErrorResponse } from '@/lib/error-handler';

// GET /api/locations/[id] - Get location by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const location = await getLocationById(params.id);

    if (!location) {
      return createErrorResponse('Location not found', 404);
    }

    // Only return public data
    const publicLocation = {
      id: location.id,
      name: location.name,
      slug: location.slug,
      rating_type: location.rating_type,
      platform_urls: location.platform_urls,
      platform_order: location.platform_order,
      is_active: location.is_active,
      brand: {
        id: location.brand?.id,
        name: location.brand?.name,
        slug: location.brand?.slug,
        logo_url: location.brand?.logo_url,
        website_url: location.brand?.website_url,
      },
    };

    return createSuccessResponse({ location: publicLocation });
  } catch (error) {
    return handleError(error);
  }
}
