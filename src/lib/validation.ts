import { z } from 'zod';

// Brand validation schemas
export const createBrandSchema = z.object({
  name: z.string().min(1, 'Brand name is required').max(255, 'Brand name is too long'),
  slug: z.string().min(1, 'Slug is required').max(255, 'Slug is too long').regex(
    /^[a-z0-9-]+$/,
    'Slug can only contain lowercase letters, numbers, and hyphens'
  ),
  description: z.string().max(1000, 'Description is too long').optional(),
  logo_url: z.string().url('Invalid logo URL').optional().or(z.literal('')),
  website_url: z.string().url('Invalid website URL').optional().or(z.literal('')),
  notification_email: z.string().email('Invalid email address'),
});

export const updateBrandSchema = createBrandSchema.partial().extend({
  id: z.string().uuid('Invalid brand ID'),
});

// Location validation schemas
export const createLocationSchema = z.object({
  brand_id: z.string().uuid('Invalid brand ID'),
  name: z.string().min(1, 'Location name is required').max(255, 'Location name is too long'),
  slug: z.string().min(1, 'Slug is required').max(255, 'Slug is too long').regex(
    /^[a-z0-9-]+$/,
    'Slug can only contain lowercase letters, numbers, and hyphens'
  ),
  rating_type: z.enum(['emoji', 'thumbs']),
  platform_urls: z.record(z.string().url('Invalid platform URL')),
  platform_order: z.array(z.string()).min(1, 'At least one platform is required'),
  notification_email: z.string().email('Invalid email address').optional().or(z.literal('')),
  is_active: z.boolean(),
});

export const updateLocationSchema = createLocationSchema.partial().extend({
  id: z.string().uuid('Invalid location ID'),
});

// Review validation schemas
export const createReviewSchema = z.object({
  location_id: z.string().uuid('Invalid location ID'),
  nps_score: z.number().int().min(1, 'Rating must be at least 1').max(5, 'Rating must be at most 5'),
  customer_name: z.string().max(255, 'Name is too long').optional(),
  customer_email: z.string().email('Invalid email address').optional().or(z.literal('')),
  customer_phone: z.string().max(20, 'Phone number is too long').optional(),
  comments: z.string().max(2000, 'Comments are too long').optional(),
  feedback_type: z.enum(['positive', 'negative']),
  external_review_url: z.string().url('Invalid review URL').optional().or(z.literal('')),
});

// Review platform validation schemas
export const createReviewPlatformSchema = z.object({
  name: z.string().min(1, 'Platform name is required').max(255, 'Platform name is too long'),
  key: z.string().min(1, 'Platform key is required').max(100, 'Platform key is too long').regex(
    /^[a-z0-9-_]+$/,
    'Platform key can only contain lowercase letters, numbers, hyphens, and underscores'
  ),
  logo_url: z.string().url('Invalid logo URL').optional().or(z.literal('')),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid color format').default('#6B7280'),
  priority: z.number().int().min(0).default(0),
  is_active: z.boolean().default(true),
});

export const updateReviewPlatformSchema = createReviewPlatformSchema.partial().extend({
  id: z.string().uuid('Invalid platform ID'),
});

// Admin user validation schemas
export const createAdminUserSchema = z.object({
  email: z.string().email('Invalid email address'),
  name: z.string().min(1, 'Name is required').max(255, 'Name is too long'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum(['admin', 'super_admin']).default('admin'),
});

export const updateAdminUserSchema = createAdminUserSchema.partial().extend({
  id: z.string().uuid('Invalid user ID'),
  password: z.string().min(8, 'Password must be at least 8 characters').optional(),
});

// Authentication validation schemas
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

// File upload validation
export const fileUploadSchema = z.object({
  file: z.instanceof(File),
  bucket: z.enum(['brand-logos', 'platform-logos']),
});

// Query validation schemas
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export const reviewFiltersSchema = paginationSchema.extend({
  feedback_type: z.enum(['positive', 'negative']).optional(),
  location_id: z.string().uuid().optional(),
  brand_id: z.string().uuid().optional(),
  date_from: z.string().datetime().optional(),
  date_to: z.string().datetime().optional(),
});

// Type exports
export type CreateBrandData = z.infer<typeof createBrandSchema>;
export type UpdateBrandData = z.infer<typeof updateBrandSchema>;
export type CreateLocationData = z.infer<typeof createLocationSchema>;
export type UpdateLocationData = z.infer<typeof updateLocationSchema>;
export type CreateReviewData = z.infer<typeof createReviewSchema>;
export type CreateReviewPlatformData = z.infer<typeof createReviewPlatformSchema>;
export type UpdateReviewPlatformData = z.infer<typeof updateReviewPlatformSchema>;
export type CreateAdminUserData = z.infer<typeof createAdminUserSchema>;
export type UpdateAdminUserData = z.infer<typeof updateAdminUserSchema>;
export type LoginCredentials = z.infer<typeof loginSchema>;
export type ForgotPasswordData = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordData = z.infer<typeof resetPasswordSchema>;
export type FileUploadData = z.infer<typeof fileUploadSchema>;
export type PaginationParams = z.infer<typeof paginationSchema>;
export type ReviewFilters = z.infer<typeof reviewFiltersSchema>;
