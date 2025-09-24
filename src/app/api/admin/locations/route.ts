import { NextRequest } from 'next/server';
import { createAdminClient } from '@/lib/supabase-server';
import { requireAuth } from '@/lib/admin-auth';
import { createLocationSchema } from '@/lib/validation';
import { adminApiRateLimit } from '@/lib/rate-limiter';
import { rateLimitMiddleware } from '@/lib/rate-limiter';
import { handleError, createSuccessResponse } from '@/lib/error-handler';

// GET /api/admin/locations - List all locations with brand data
export const GET = requireAuth(async (request: NextRequest, user) => {
  try {
    const rateLimitResponse = await rateLimitMiddleware(request, adminApiRateLimit);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    const supabase = createAdminClient();
    
    const { data: locations, error } = await supabase
      .from('reviews_locations')
      .select(`
        *,
        brand:reviews_brands(*)
      `)
      .order('name', { ascending: true });

    if (error) {
      throw new Error(`Failed to fetch locations: ${error.message}`);
    }

    return createSuccessResponse({ locations: locations || [] });
  } catch (error) {
    return handleError(error);
  }
});

// POST /api/admin/locations - Create new location
export const POST = requireAuth(async (request: NextRequest, user) => {
  try {
    const rateLimitResponse = await rateLimitMiddleware(request, adminApiRateLimit);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    const body = await request.json();
    const validatedData = createLocationSchema.parse(body);

    const supabase = createAdminClient();

    // Check if brand exists
    const { data: brand, error: brandError } = await supabase
      .from('reviews_brands')
      .select('id')
      .eq('id', validatedData.brand_id)
      .single();

    if (brandError || !brand) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Brand not found',
        }),
        { 
          status: 404, 
          headers: { 'Content-Type': 'application/json' } 
        }
      );
    }

    // Check if location slug already exists for this brand
    const { data: existingLocation } = await supabase
      .from('reviews_locations')
      .select('id')
      .eq('brand_id', validatedData.brand_id)
      .eq('slug', validatedData.slug)
      .single();

    if (existingLocation) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'A location with this slug already exists for this brand',
        }),
        { 
          status: 409, 
          headers: { 'Content-Type': 'application/json' } 
        }
      );
    }

    const { data: location, error } = await supabase
      .from('reviews_locations')
      .insert(validatedData)
      .select(`
        *,
        brand:reviews_brands(*)
      `)
      .single();

    if (error) {
      throw new Error(`Failed to create location: ${error.message}`);
    }

    return createSuccessResponse({ location });
  } catch (error) {
    return handleError(error);
  }
});
