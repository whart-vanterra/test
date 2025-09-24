import { NextRequest } from 'next/server';
import { createAdminClient } from '@/lib/supabase-server';
import { requireAuth, requireRole } from '@/lib/admin-auth';
import { updateBrandSchema } from '@/lib/validation';
import { adminApiRateLimit } from '@/lib/rate-limiter';
import { rateLimitMiddleware } from '@/lib/rate-limiter';
import { handleError, createSuccessResponse, createErrorResponse } from '@/lib/error-handler';
import { uploadFile } from '@/lib/file-upload';

// PUT /api/admin/brands/[id] - Update brand
export const PUT = requireAuth(async (request: NextRequest, user, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const rateLimitResponse = await rateLimitMiddleware(request, adminApiRateLimit);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    const { id } = await params;
    const formData = await request.formData();
    const brandData = {
      id,
      name: formData.get('name') as string,
      slug: formData.get('slug') as string,
      description: formData.get('description') as string || null,
      website_url: formData.get('website_url') as string || null,
      notification_email: formData.get('notification_email') as string,
    };

    const validatedData = updateBrandSchema.parse(brandData);
    const logoFile = formData.get('logoFile') as File | null;

    const supabase = createAdminClient();

    // Check if brand exists
    const { data: existingBrand, error: fetchError } = await supabase
      .from('reviews_brands')
      .select('id, slug')
      .eq('id', id)
      .single();

    if (fetchError || !existingBrand) {
      return createErrorResponse('Brand not found', 404);
    }

    // Check if slug already exists (excluding current brand)
    if (validatedData.slug !== existingBrand.slug) {
      const { data: slugConflict } = await supabase
        .from('reviews_brands')
        .select('id')
        .eq('slug', validatedData.slug)
        .neq('id', id)
        .single();

      if (slugConflict) {
        return createErrorResponse('A brand with this slug already exists', 409);
      }
    }

    let logoUrl = validatedData.logo_url;

    // Upload new logo if provided
    if (logoFile && logoFile.size > 0) {
      const uploadResult = await uploadFile(logoFile, 'brand-logos');
      logoUrl = uploadResult.url;
    }

    const { data: brand, error } = await supabase
      .from('reviews_brands')
      .update({
        name: validatedData.name,
        slug: validatedData.slug,
        description: validatedData.description,
        website_url: validatedData.website_url,
        notification_email: validatedData.notification_email,
        logo_url: logoUrl,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update brand: ${error.message}`);
    }

    return createSuccessResponse({ brand });
  } catch (error) {
    return handleError(error);
  }
});

// DELETE /api/admin/brands/[id] - Delete brand
export const DELETE = requireAuth(async (request: NextRequest, user, { params }: { params: { id: string } }) => {
  try {
    const rateLimitResponse = await rateLimitMiddleware(request, adminApiRateLimit);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    const supabase = createAdminClient();

    // Check if brand exists and has locations
    const { data: brandWithLocations, error: fetchError } = await supabase
      .from('reviews_brands')
      .select(`
        id,
        name,
        locations:reviews_locations(id)
      `)
      .eq('id', id)
      .single();

    if (fetchError || !brandWithLocations) {
      return createErrorResponse('Brand not found', 404);
    }

    // Check if brand has locations
    if (brandWithLocations.locations && brandWithLocations.locations.length > 0) {
      return createErrorResponse(
        'Cannot delete brand that has locations. Please delete all locations first.',
        409
      );
    }

    const { error } = await supabase
      .from('reviews_brands')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete brand: ${error.message}`);
    }

    return createSuccessResponse({ message: 'Brand deleted successfully' });
  } catch (error) {
    return handleError(error);
  }
});
