// Core types for the Vanterra Reviews system

export interface Brand {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logo_url?: string;
  website_url?: string;
  notification_email: string;
  created_at: string;
  updated_at: string;
}

export interface Location {
  id: string;
  brand_id: string;
  name: string;
  slug: string;
  rating_type: 'emoji' | 'thumbs';
  platform_urls: Record<string, string>;
  platform_order: string[];
  notification_email?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  brand?: Brand;
}

export interface Review {
  id: string;
  location_id: string;
  nps_score: number;
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
  comments?: string;
  feedback_type: 'positive' | 'negative';
  external_review_url?: string;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
  location?: Location;
}

export interface ReviewPlatform {
  id: string;
  name: string;
  key: string;
  logo_url?: string;
  color: string;
  priority: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface NegativeFeedback {
  id: string;
  review_id: string;
  location_id: string;
  email_sent: boolean;
  email_sent_at?: string;
  gm_notified: boolean;
  gm_notified_at?: string;
  created_at: string;
  review?: Review;
  location?: Location;
}

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  password_hash: string;
  role: 'admin' | 'super_admin';
  is_active: boolean;
  reset_token?: string;
  reset_token_expires?: string;
  created_at: string;
  updated_at: string;
}

// Form data types
export interface CreateBrandData {
  name: string;
  slug: string;
  description?: string;
  logo_url?: string;
  website_url?: string;
  notification_email: string;
}

export interface UpdateBrandData extends Partial<CreateBrandData> {
  id: string;
}

export interface CreateLocationData {
  brand_id: string;
  name: string;
  slug: string;
  rating_type: 'emoji' | 'thumbs';
  platform_urls: Record<string, string>;
  platform_order: string[];
  notification_email?: string;
  is_active: boolean;
}

export interface UpdateLocationData extends Partial<CreateLocationData> {
  id: string;
}

export interface CreateReviewData {
  location_id: string;
  nps_score: number;
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
  comments?: string;
  feedback_type: 'positive' | 'negative';
  external_review_url?: string;
}

export interface CreateReviewPlatformData {
  name: string;
  key: string;
  logo_url?: string;
  color: string;
  priority: number;
  is_active: boolean;
}

export interface UpdateReviewPlatformData extends Partial<CreateReviewPlatformData> {
  id: string;
}

export interface CreateAdminUserData {
  email: string;
  name: string;
  password: string;
  role: 'admin' | 'super_admin';
}

export interface UpdateAdminUserData extends Partial<CreateAdminUserData> {
  id: string;
  password?: string;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Dashboard stats
export interface DashboardStats {
  totalReviews: number;
  positiveReviews: number;
  negativeReviews: number;
  totalBrands: number;
  totalLocations: number;
  recentReviews: Review[];
}

// Authentication types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'super_admin';
}

export interface AuthResponse {
  user: AuthUser;
  token: string;
}

// File upload types
export interface FileUploadResult {
  url: string;
  path: string;
}

// Rate limiting types
export interface RateLimitConfig {
  windowMs: number;
  max: number;
  message: string;
}

// Email types
export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

export interface NegativeFeedbackEmailData {
  brandName: string;
  locationName: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  comments: string;
  rating: number;
  reviewUrl: string;
}

// GTM Event types
export interface GTMEvent {
  event: string;
  [key: string]: any;
}
