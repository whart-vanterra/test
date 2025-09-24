import { NextRequest } from 'next/server';
import { createAdminClient } from '@/lib/supabase-server';
import { requireAuth } from '@/lib/admin-auth';
import { createReviewPlatformSchema } from '@/lib/validation';
import { adminApiRateLimit } from '@/lib/rate-limiter';
import { rateLimitMiddleware } from '@/lib/rate-limiter';
import { handleError, createSuccessResponse } from '@/lib/error-handler';
import { uploadFile } from '@/lib/file-upload';

// GET /api/admin/review-platforms - List all review platforms
export const GET = requireAuth(async (request: NextRequest, user) => {
  try {
    const rateLimitResponse = await rateLimitMiddleware(request, adminApiRateLimit);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    const supabase = createAdminClient();
    
    const { data: platforms, error } = await supabase
      .from('reviews_platforms')
      .select('*')
      .order('priority', { ascending: true });

    if (error) {
      throw new Error(`Failed to fetch review platforms: ${error.message}`);
    }

    return createSuccessResponse({ platforms: platforms || [] });
  } catch (error) {
    return handleError(error);
  }
});

// POST /api/admin/review-platforms - Create new platform
export const POST = requireAuth(async (request: NextRequest, user) => {
  try {
    const rateLimitResponse = await rateLimitMiddleware(request, adminApiRateLimit);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    const formData = await request.formData();
    const platformData = {
      name: formData.get('name') as string,
      key: formData.get('key') as string,
      color: formData.get('color') as string,
      priority: parseInt(formData.get('priority') as string) || 0,
      is_active: formData.get('is_active') === 'true',
    };

    const validatedData = createReviewPlatformSchema.parse(platformData);
    const logoFile = formData.get('logoFile') as File | null;

    const supabase = createAdminClient();

    // Check if platform key already exists
    const { data: existingPlatform } = await supabase
      .from('reviews_platforms')
      .select('id')
      .eq('key', validatedData.key)
      .single();

    if (existingPlatform) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'A platform with this key already exists',
        }),
        { 
          status: 409, 
          headers: { 'Content-Type': 'application/json' } 
        }
      );
    }

    let logoUrl = validatedData.logo_url;

    // Upload logo if provided
    if (logoFile && logoFile.size > 0) {
      const uploadResult = await uploadFile(logoFile, 'platform-logos');
      logoUrl = uploadResult.url;
    }

    const { data: platform, error } = await supabase
      .from('reviews_platforms')
      .insert({
        ...validatedData,
        logo_url: logoUrl,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create platform: ${error.message}`);
    }

    return createSuccessResponse({ platform });
  } catch (error) {
    return handleError(error);
  }
});
