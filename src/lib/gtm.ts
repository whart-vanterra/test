// Google Tag Manager utilities for tracking events

export interface GTMEvent {
  event: string;
  [key: string]: unknown;
}

export interface ReviewGTMEvent extends GTMEvent {
  event: 'review_started' | 'review_rating_selected' | 'review_platform_clicked' | 'review_completed';
  brand_name?: string;
  location_name?: string;
  rating?: number;
  feedback_type?: 'positive' | 'negative';
  platform_name?: string;
  step_number?: number;
}

export interface AdminGTMEvent extends GTMEvent {
  event: 'admin_login' | 'admin_logout' | 'admin_brand_created' | 'admin_location_created' | 'admin_review_deleted';
  admin_user_id?: string;
  admin_role?: string;
  brand_name?: string;
  location_name?: string;
  review_id?: string;
}

declare global {
  interface Window {
    dataLayer: unknown[];
  }
}

export function initializeGTM(gtmId: string): void {
  if (typeof window === 'undefined') return;

  // Initialize dataLayer if it doesn't exist
  if (!window.dataLayer) {
    window.dataLayer = [];
  }

  // Load GTM script
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtm.js?id=${gtmId}`;
  document.head.appendChild(script);

  // Initialize GTM
  window.dataLayer.push({
    'gtm.start': new Date().getTime(),
    event: 'gtm.js'
  });
}

export function trackEvent(event: GTMEvent): void {
  if (typeof window === 'undefined' || !window.dataLayer) return;

  window.dataLayer.push(event);
}

export function trackReviewEvent(event: ReviewGTMEvent): void {
  trackEvent(event);
}

export function trackAdminEvent(event: AdminGTMEvent): void {
  trackEvent(event);
}

// Specific event tracking functions
export function trackReviewStarted(brandName: string, locationName: string): void {
  trackReviewEvent({
    event: 'review_started',
    brand_name: brandName,
    location_name: locationName,
    step_number: 1,
  });
}

export function trackRatingSelected(
  brandName: string,
  locationName: string,
  rating: number,
  feedbackType: 'positive' | 'negative'
): void {
  trackReviewEvent({
    event: 'review_rating_selected',
    brand_name: brandName,
    location_name: locationName,
    rating,
    feedback_type: feedbackType,
    step_number: 2,
  });
}

export function trackPlatformClicked(
  brandName: string,
  locationName: string,
  platformName: string,
  feedbackType: 'positive' | 'negative'
): void {
  trackReviewEvent({
    event: 'review_platform_clicked',
    brand_name: brandName,
    location_name: locationName,
    platform_name: platformName,
    feedback_type: feedbackType,
    step_number: 3,
  });
}

export function trackReviewCompleted(
  brandName: string,
  locationName: string,
  rating: number,
  feedbackType: 'positive' | 'negative'
): void {
  trackReviewEvent({
    event: 'review_completed',
    brand_name: brandName,
    location_name: locationName,
    rating,
    feedback_type: feedbackType,
    step_number: 4,
  });
}

export function trackAdminLogin(userId: string, role: string): void {
  trackAdminEvent({
    event: 'admin_login',
    admin_user_id: userId,
    admin_role: role,
  });
}

export function trackAdminLogout(userId: string, role: string): void {
  trackAdminEvent({
    event: 'admin_logout',
    admin_user_id: userId,
    admin_role: role,
  });
}

export function trackBrandCreated(userId: string, role: string, brandName: string): void {
  trackAdminEvent({
    event: 'admin_brand_created',
    admin_user_id: userId,
    admin_role: role,
    brand_name: brandName,
  });
}

export function trackLocationCreated(
  userId: string,
  role: string,
  brandName: string,
  locationName: string
): void {
  trackAdminEvent({
    event: 'admin_location_created',
    admin_user_id: userId,
    admin_role: role,
    brand_name: brandName,
    location_name: locationName,
  });
}

export function trackReviewDeleted(
  userId: string,
  role: string,
  reviewId: string
): void {
  trackAdminEvent({
    event: 'admin_review_deleted',
    admin_user_id: userId,
    admin_role: role,
    review_id: reviewId,
  });
}

// Page view tracking
export function trackPageView(page: string, title?: string): void {
  trackEvent({
    event: 'page_view',
    page,
    title: title || page,
  });
}

// Custom event tracking for specific business metrics
export function trackNegativeFeedbackSubmitted(
  brandName: string,
  locationName: string,
  rating: number
): void {
  trackEvent({
    event: 'negative_feedback_submitted',
    brand_name: brandName,
    location_name: locationName,
    rating,
    category: 'customer_feedback',
  });
}

export function trackPositiveReviewRedirect(
  brandName: string,
  locationName: string,
  platformName: string
): void {
  trackEvent({
    event: 'positive_review_redirect',
    brand_name: brandName,
    location_name: locationName,
    platform_name: platformName,
    category: 'review_platform',
  });
}
