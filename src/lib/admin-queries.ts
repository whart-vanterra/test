import { createAdminClient } from './supabase-server';
import { Brand, Location, Review, ReviewPlatform, AdminUser, DashboardStats } from './types';

// Brand queries
export async function getAllBrands(): Promise<Brand[]> {
  const supabase = createAdminClient();
  
  const { data, error } = await supabase
    .from('reviews_brands')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch brands: ${error.message}`);
  }

  return data || [];
}

export async function getBrandById(id: string): Promise<Brand | null> {
  const supabase = createAdminClient();
  
  const { data, error } = await supabase
    .from('reviews_brands')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // Row not found
    throw new Error(`Failed to fetch brand: ${error.message}`);
  }

  return data;
}

export async function getBrandBySlug(slug: string): Promise<Brand | null> {
  const supabase = createAdminClient();
  
  const { data, error } = await supabase
    .from('reviews_brands')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // Row not found
    throw new Error(`Failed to fetch brand: ${error.message}`);
  }

  return data;
}

// Location queries
export async function getAllLocations(): Promise<Location[]> {
  const supabase = createAdminClient();
  
  const { data, error } = await supabase
    .from('reviews_locations')
    .select(`
      *,
      brand:reviews_brands(*)
    `)
    .order('name', { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch locations: ${error.message}`);
  }

  return data || [];
}

export async function getLocationById(id: string): Promise<Location | null> {
  const supabase = createAdminClient();
  
  const { data, error } = await supabase
    .from('reviews_locations')
    .select(`
      *,
      brand:reviews_brands(*)
    `)
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // Row not found
    throw new Error(`Failed to fetch location: ${error.message}`);
  }

  return data;
}

export async function getLocationByBrandAndSlug(brandSlug: string, locationSlug: string): Promise<Location | null> {
  const supabase = createAdminClient();
  
  const { data, error } = await supabase
    .from('reviews_locations')
    .select(`
      *,
      brand:reviews_brands(*)
    `)
    .eq('slug', locationSlug)
    .eq('brand.slug', brandSlug)
    .eq('is_active', true)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // Row not found
    throw new Error(`Failed to fetch location: ${error.message}`);
  }

  return data;
}

export async function getLocationsByBrand(brandId: string): Promise<Location[]> {
  const supabase = createAdminClient();
  
  const { data, error } = await supabase
    .from('reviews_locations')
    .select(`
      *,
      brand:reviews_brands(*)
    `)
    .eq('brand_id', brandId)
    .order('name', { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch locations: ${error.message}`);
  }

  return data || [];
}

// Review queries
export async function getAllReviews(page: number = 1, limit: number = 20, filters: {
  feedback_type?: 'positive' | 'negative';
  location_id?: string;
  brand_id?: string;
  search?: string;
} = {}): Promise<{ data: Review[]; total: number }> {
  const supabase = createAdminClient();
  
  let query = supabase
    .from('reviews_reviews')
    .select(`
      *,
      location:reviews_locations(
        *,
        brand:reviews_brands(*)
      )
    `, { count: 'exact' });

  // Apply filters
  if (filters.feedback_type) {
    query = query.eq('feedback_type', filters.feedback_type);
  }
  
  if (filters.location_id) {
    query = query.eq('location_id', filters.location_id);
  }
  
  if (filters.brand_id) {
    query = query.eq('location.brand_id', filters.brand_id);
  }
  
  if (filters.search) {
    query = query.or(`customer_name.ilike.%${filters.search}%,comments.ilike.%${filters.search}%`);
  }

  // Apply pagination and ordering
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  
  const { data, error, count } = await query
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) {
    throw new Error(`Failed to fetch reviews: ${error.message}`);
  }

  return {
    data: data || [],
    total: count || 0,
  };
}

export async function getReviewById(id: string): Promise<Review | null> {
  const supabase = createAdminClient();
  
  const { data, error } = await supabase
    .from('reviews_reviews')
    .select(`
      *,
      location:reviews_locations(
        *,
        brand:reviews_brands(*)
      )
    `)
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // Row not found
    throw new Error(`Failed to fetch review: ${error.message}`);
  }

  return data;
}

export async function getRecentReviews(limit: number = 10): Promise<Review[]> {
  const supabase = createAdminClient();
  
  const { data, error } = await supabase
    .from('reviews_reviews')
    .select(`
      *,
      location:reviews_locations(
        *,
        brand:reviews_brands(*)
      )
    `)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`Failed to fetch recent reviews: ${error.message}`);
  }

  return data || [];
}

// Review platform queries
export async function getAllReviewPlatforms(): Promise<ReviewPlatform[]> {
  const supabase = createAdminClient();
  
  const { data, error } = await supabase
    .from('reviews_platforms')
    .select('*')
    .order('priority', { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch review platforms: ${error.message}`);
  }

  return data || [];
}

export async function getActiveReviewPlatforms(): Promise<ReviewPlatform[]> {
  const supabase = createAdminClient();
  
  const { data, error } = await supabase
    .from('reviews_platforms')
    .select('*')
    .eq('is_active', true)
    .order('priority', { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch active review platforms: ${error.message}`);
  }

  return data || [];
}

export async function getReviewPlatformByKey(key: string): Promise<ReviewPlatform | null> {
  const supabase = createAdminClient();
  
  const { data, error } = await supabase
    .from('reviews_platforms')
    .select('*')
    .eq('key', key)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // Row not found
    throw new Error(`Failed to fetch review platform: ${error.message}`);
  }

  return data;
}

// Admin user queries
export async function getAllAdminUsers(): Promise<AdminUser[]> {
  const supabase = createAdminClient();
  
  const { data, error } = await supabase
    .from('reviews_admin_users')
    .select('id, email, name, role, is_active, created_at, updated_at')
    .order('name', { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch admin users: ${error.message}`);
  }

  return data || [];
}

export async function getAdminUserById(id: string): Promise<AdminUser | null> {
  const supabase = createAdminClient();
  
  const { data, error } = await supabase
    .from('reviews_admin_users')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // Row not found
    throw new Error(`Failed to fetch admin user: ${error.message}`);
  }

  return data;
}

export async function getAdminUserByEmail(email: string): Promise<AdminUser | null> {
  const supabase = createAdminClient();
  
  const { data, error } = await supabase
    .from('reviews_admin_users')
    .select('*')
    .eq('email', email.toLowerCase())
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // Row not found
    throw new Error(`Failed to fetch admin user: ${error.message}`);
  }

  return data;
}

// Dashboard stats
export async function getDashboardStats(): Promise<DashboardStats> {
  const supabase = createAdminClient();
  
  // Get total reviews count
  const { count: totalReviews } = await supabase
    .from('reviews_reviews')
    .select('*', { count: 'exact', head: true });

  // Get positive reviews count
  const { count: positiveReviews } = await supabase
    .from('reviews_reviews')
    .select('*', { count: 'exact', head: true })
    .eq('feedback_type', 'positive');

  // Get negative reviews count
  const { count: negativeReviews } = await supabase
    .from('reviews_reviews')
    .select('*', { count: 'exact', head: true })
    .eq('feedback_type', 'negative');

  // Get total brands count
  const { count: totalBrands } = await supabase
    .from('reviews_brands')
    .select('*', { count: 'exact', head: true });

  // Get total locations count
  const { count: totalLocations } = await supabase
    .from('reviews_locations')
    .select('*', { count: 'exact', head: true });

  // Get recent reviews
  const recentReviews = await getRecentReviews(5);

  return {
    totalReviews: totalReviews || 0,
    positiveReviews: positiveReviews || 0,
    negativeReviews: negativeReviews || 0,
    totalBrands: totalBrands || 0,
    totalLocations: totalLocations || 0,
    recentReviews,
  };
}
