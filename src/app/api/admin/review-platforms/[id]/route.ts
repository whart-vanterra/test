import { NextRequest } from 'next/server';
import { createAdminClient } from '@/lib/supabase-server';
import { requireAuth } from '@/lib/admin-auth';
import { updateReviewPlatformSchema } from '@/lib/validation';
import { adminApiRateLimit } from '@/lib/rate-limiter';
import { rateLimitMiddleware } from '@/lib/rate-limiter';
import { handleError, createSuccessResponse, createErrorResponse } from '@/lib/error-handler';
import { uploadFile } from '@/lib/file-upload';

// PUT /api/admin/review-platforms/[id] - Update platform
export const PUT = requireAuth(async (request: NextRequest, user, { params }: { params: { id: string } }) => {
  try {
    const rateLimitResponse = await rateLimitMiddleware(request, adminApiRateLimit);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    const formData = await request.formData();
    const platformData = {
      id: params.id,
      name: formData.get('name') as string,
      key: formData.get('key') as string,
      color: formData.get('color') as string,
      priority: parseInt(formData.get('priority') as string) || 0,
      is_active: formData.get('is_active') === 'true',
    };

    const validatedData = updateReviewPlatformSchema.parse(platformData);
    const logoFile = formData.get('logoFile') as File | null;

    const supabase = createAdminClient();

    // Check if platform exists
    const { data: existingPlatform, error: fetchError } = await supabase
      .from('reviews_platforms')
      .select('id, key')
      .eq('id', params.id)
      .single();

    if (fetchError || !existingPlatform) {
      return createErrorResponse('Platform not found', 404);
    }

    // Check if platform key already exists (excluding current platform)
    if (validatedData.key !== existingPlatform.key) {
      const { data: keyConflict } = await supabase
        .from('reviews_platforms')
        .select('id')
        .eq('key', validatedData.key)
        .neq('id', params.id)
        .single();

      if (keyConflict) {
        return createErrorResponse('A platform with this key already exists', 409);
      }
    }

    let logoUrl = validatedData.logo_url;

    // Upload new logo if provided
    if (logoFile && logoFile.size > 0) {
      const uploadResult = await uploadFile(logoFile, 'platform-logos');
      logoUrl = uploadResult.url;
    }

    const { data: platform, error } = await supabase
      .from('reviews_platforms')
      .update({
        name: validatedData.name,
        key: validatedData.key,
        color: validatedData.color,
        priority: validatedData.priority,
        is_active: validatedData.is_active,
        logo_url: logoUrl,
        updated_at: new Date().toISOString(),
      })
      .eq('id', params.id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update platform: ${error.message}`);
    }

    return createSuccessResponse({ platform });
  } catch (error) {
    return handleError(error);
  }
});

// DELETE /api/admin/review-platforms/[id] - Delete platform
export const DELETE = requireAuth(async (request: NextRequest, user, { params }: { params: { id: string } }) => {
  try {
    const rateLimitResponse = await rateLimitMiddleware(request, adminApiRateLimit);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    const supabase = createAdminClient();

    // Check if platform exists and is being used
    const { data: platformWithUsage, error: fetchError } = await supabase
      .from('reviews_platforms')
      .select(`
        id,
        name,
        locations:reviews_locations!platform_order
      `)
      .eq('id', params.id)
      .single();

    if (fetchError || !platformWithUsage) {
      return createErrorResponse('Platform not found', 404);
    }

    // Check if platform is being used by any locations
    const platformKey = platformWithUsage.key;
    const { data: locationsUsingPlatform } = await supabase
      .from('reviews_locations')
      .select('id, name')
      .contains('platform_order', [platformKey]);

    if (locationsUsingPlatform && locationsUsingPlatform.length > 0) {
      return createErrorResponse(
        'Cannot delete platform that is being used by locations. Please remove it from all locations first.',
        409
      );
    }

    const { error } = await supabase
      .from('reviews_platforms')
      .delete()
      .eq('id', params.id);

    if (error) {
      throw new Error(`Failed to delete platform: ${error.message}`);
    }

    return createSuccessResponse({ message: 'Platform deleted successfully' });
  } catch (error) {
    return handleError(error);
  }
});
