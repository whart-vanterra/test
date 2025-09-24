import { NextRequest } from 'next/server';
import { createAdminClient } from '@/lib/supabase-server';
import { requireAuth } from '@/lib/admin-auth';
import { updateLocationSchema } from '@/lib/validation';
import { adminApiRateLimit } from '@/lib/rate-limiter';
import { rateLimitMiddleware } from '@/lib/rate-limiter';
import { handleError, createSuccessResponse, createErrorResponse } from '@/lib/error-handler';

// PUT /api/admin/locations/[id] - Update location
export const PUT = requireAuth(async (request: NextRequest, user, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const rateLimitResponse = await rateLimitMiddleware(request, adminApiRateLimit);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    const { id } = await params;
    const body = await request.json();
    const validatedData = updateLocationSchema.parse({ ...body, id });

    const supabase = createAdminClient();

    // Check if location exists
    const { data: existingLocation, error: fetchError } = await supabase
      .from('reviews_locations')
      .select('id, brand_id, slug')
      .eq('id', id)
      .single();

    if (fetchError || !existingLocation) {
      return createErrorResponse('Location not found', 404);
    }

    // Check if brand exists (if brand_id is being updated)
    if (validatedData.brand_id && validatedData.brand_id !== existingLocation.brand_id) {
      const { data: brand, error: brandError } = await supabase
        .from('reviews_brands')
        .select('id')
        .eq('id', validatedData.brand_id)
        .single();

      if (brandError || !brand) {
        return createErrorResponse('Brand not found', 404);
      }
    }

    // Check if location slug already exists for this brand (excluding current location)
    if (validatedData.slug && validatedData.slug !== existingLocation.slug) {
      const { data: slugConflict } = await supabase
        .from('reviews_locations')
        .select('id')
        .eq('brand_id', validatedData.brand_id || existingLocation.brand_id)
        .eq('slug', validatedData.slug)
        .neq('id', id)
        .single();

      if (slugConflict) {
        return createErrorResponse('A location with this slug already exists for this brand', 409);
      }
    }

    const { data: location, error } = await supabase
      .from('reviews_locations')
      .update({
        ...validatedData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select(`
        *,
        brand:reviews_brands(*)
      `)
      .single();

    if (error) {
      throw new Error(`Failed to update location: ${error.message}`);
    }

    return createSuccessResponse({ location });
  } catch (error) {
    return handleError(error);
  }
});

// DELETE /api/admin/locations/[id] - Delete location
export const DELETE = requireAuth(async (request: NextRequest, user, { params }: { params: { id: string } }) => {
  try {
    const rateLimitResponse = await rateLimitMiddleware(request, adminApiRateLimit);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    const supabase = createAdminClient();

    // Check if location exists and has reviews
    const { data: locationWithReviews, error: fetchError } = await supabase
      .from('reviews_locations')
      .select(`
        id,
        name,
        reviews:reviews_reviews(id)
      `)
      .eq('id', id)
      .single();

    if (fetchError || !locationWithReviews) {
      return createErrorResponse('Location not found', 404);
    }

    // Check if location has reviews
    if (locationWithReviews.reviews && locationWithReviews.reviews.length > 0) {
      return createErrorResponse(
        'Cannot delete location that has reviews. Please delete all reviews first.',
        409
      );
    }

    const { error } = await supabase
      .from('reviews_locations')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete location: ${error.message}`);
    }

    return createSuccessResponse({ message: 'Location deleted successfully' });
  } catch (error) {
    return handleError(error);
  }
});
