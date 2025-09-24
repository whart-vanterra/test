import { NextRequest } from 'next/server';
import { createAdminClient } from '@/lib/supabase-server';
import { requireAuth, requireRole } from '@/lib/admin-auth';
import { createBrandSchema } from '@/lib/validation';
import { adminApiRateLimit } from '@/lib/rate-limiter';
import { rateLimitMiddleware } from '@/lib/rate-limiter';
import { handleError, createSuccessResponse } from '@/lib/error-handler';
import { uploadFile } from '@/lib/file-upload';

// GET /api/admin/brands - List all brands
export const GET = requireAuth(async (request: NextRequest, user) => {
  try {
    const rateLimitResponse = await rateLimitMiddleware(request, adminApiRateLimit);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    const supabase = createAdminClient();
    
    const { data: brands, error } = await supabase
      .from('reviews_brands')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      throw new Error(`Failed to fetch brands: ${error.message}`);
    }

    return createSuccessResponse({ brands: brands || [] });
  } catch (error) {
    return handleError(error);
  }
});

// POST /api/admin/brands - Create new brand
export const POST = requireAuth(async (request: NextRequest, user) => {
  try {
    const rateLimitResponse = await rateLimitMiddleware(request, adminApiRateLimit);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    const formData = await request.formData();
    const brandData = {
      name: formData.get('name') as string,
      slug: formData.get('slug') as string,
      description: formData.get('description') as string || null,
      website_url: formData.get('website_url') as string || null,
      notification_email: formData.get('notification_email') as string,
    };

    const validatedData = createBrandSchema.parse(brandData);
    const logoFile = formData.get('logoFile') as File | null;

    const supabase = createAdminClient();

    // Check if slug already exists
    const { data: existingBrand } = await supabase
      .from('reviews_brands')
      .select('id')
      .eq('slug', validatedData.slug)
      .single();

    if (existingBrand) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'A brand with this slug already exists',
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
      const uploadResult = await uploadFile(logoFile, 'brand-logos');
      logoUrl = uploadResult.url;
    }

    const { data: brand, error } = await supabase
      .from('reviews_brands')
      .insert({
        ...validatedData,
        logo_url: logoUrl,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create brand: ${error.message}`);
    }

    return createSuccessResponse({ brand });
  } catch (error) {
    return handleError(error);
  }
});
