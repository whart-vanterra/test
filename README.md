# Vanterra Reviews - Customer Feedback Management System

A comprehensive customer feedback management system built with Next.js 15, React, TypeScript, and Supabase. This platform allows businesses to collect customer reviews, manage feedback, and redirect positive reviews to external review platforms.

## Features

- **Multi-step Review Collection**: Customizable rating systems (emoji or thumbs up/down)
- **Automatic Email Notifications**: Negative feedback alerts sent to management
- **Admin Dashboard**: Complete management interface for brands, locations, reviews, and users
- **Public Review Pages**: Custom branded review submission forms
- **Rate Limiting & Security**: Cloudflare Turnstile integration and comprehensive security features
- **Analytics & Tracking**: Google Tag Manager integration and detailed analytics
- **File Upload System**: Brand logos and platform icon management

## Technology Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS 4** - Utility-first CSS framework
- **React Hook Form** - Form handling
- **React Hot Toast** - Notifications
- **Lucide React** - Icons

### Backend
- **Next.js API Routes** - Server-side API endpoints
- **Supabase** - PostgreSQL database and authentication
- **bcryptjs** - Password hashing
- **jsonwebtoken** - JWT token management
- **nodemailer** - Email sending
- **zod** - Schema validation

### Security & Performance
- **Cloudflare Turnstile** - Bot protection
- **Rate limiting** - Request throttling
- **CSRF protection** - Cross-site request forgery protection
- **File upload** - Supabase storage integration

## Quick Start

### 1. Clone and Install

```bash
git clone <repository-url>
cd vanterra-reviews
npm install
```

### 2. Environment Setup

Copy the example environment file:

```bash
cp env.example .env.local
```

Fill in your environment variables:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SECRET_KEY=your_supabase_secret_key

# Authentication
JWT_SECRET=your_jwt_secret

# Email
SMTP_HOST=your_smtp_host
SMTP_PORT=587
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_password

# Cloudflare Turnstile
NEXT_PUBLIC_TURNSTILE_SITE_KEY=your_turnstile_site_key
TURNSTILE_SECRET_KEY=your_turnstile_secret_key

# Google Tag Manager (optional)
NEXT_PUBLIC_GTM_ID=your_gtm_id

# App URL (for email links)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Database Setup

1. Create a new Supabase project
2. Run the SQL schema from `database/schema.sql` in your Supabase SQL editor
3. Set up the storage buckets for file uploads
4. Configure Row Level Security policies

### 4. Create Admin User

After setting up the database, create your first admin user by running this SQL in Supabase:

```sql
-- Create your first admin user (password: admin123)
INSERT INTO reviews_admin_users (email, name, password_hash, role, is_active)
VALUES (
  'admin@example.com',
  'Admin User',
  '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4VZvKcVf2e', -- admin123
  'super_admin',
  true
);
```

### 5. Run Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to access the admin dashboard.

## Usage

### Admin Dashboard

1. **Login**: Use the credentials you created in step 4
2. **Create Brands**: Add your business brands with logos and contact information
3. **Add Locations**: Create locations for each brand with review platform configurations
4. **Manage Platforms**: Configure review platforms (Google, Yelp, Facebook, etc.)
5. **Monitor Reviews**: View and manage all customer feedback

### Public Review Flow

1. **Positive Feedback**: Customers are redirected to external review platforms
2. **Negative Feedback**: Customers provide contact information for follow-up
3. **Email Notifications**: Management receives alerts for negative feedback

### Review URLs

The system generates URLs in the format:
```
/review/{brand-slug}/{location-slug}
```

Example: `/review/acme-corp/downtown-location`

## API Endpoints

### Public Endpoints
- `POST /api/reviews` - Submit customer review
- `GET /api/locations/by-brand/[brand]/[slug]` - Get location data
- `GET /api/review-platforms` - Get active review platforms

### Admin Endpoints (Authentication Required)
- `POST /api/auth/login` - Admin login
- `GET /api/admin/brands` - List brands
- `POST /api/admin/brands` - Create brand
- `GET /api/admin/locations` - List locations
- `POST /api/admin/locations` - Create location
- `GET /api/admin/reviews` - List reviews
- `GET /api/admin/overview/stats` - Dashboard statistics

## Development

### Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── admin/             # Admin dashboard pages
│   ├── api/               # API routes
│   ├── review/            # Public review pages
│   └── login/             # Authentication pages
├── components/            # React components
│   ├── ui/                # Reusable UI components
│   └── business/          # Business logic components
└── lib/                   # Utility libraries
    ├── supabase.ts        # Database client
    ├── admin-auth.ts      # Authentication logic
    ├── validation.ts      # Form validation schemas
    └── utils.ts           # Helper functions
```

### Key Components

- **BrandForm**: Create/edit brand modal with logo upload
- **LocationForm**: Create/edit location with platform configuration
- **ReviewPlatformForm**: Manage review platforms
- **OptimizedOverview**: Dashboard statistics display
- **AuthProvider**: Authentication context and routing

### Database Schema

The system uses 6 main tables:
- `reviews_brands` - Business brands
- `reviews_locations` - Business locations
- `reviews_reviews` - Customer reviews
- `reviews_platforms` - Review platforms (Google, Yelp, etc.)
- `reviews_negative_feedback` - Negative feedback tracking
- `reviews_admin_users` - Admin user accounts

## Security Features

- **JWT Authentication**: Secure admin authentication
- **Rate Limiting**: Prevents spam and abuse
- **Input Validation**: Comprehensive data validation
- **CSRF Protection**: Cross-site request forgery prevention
- **Password Hashing**: Secure password storage with bcrypt
- **File Upload Security**: Validated file uploads with size limits

## Deployment

### Production Build

```bash
npm run build
npm start
```

### Environment Variables

Ensure all production environment variables are set:
- Supabase production credentials
- SMTP email configuration
- JWT secret key
- Cloudflare Turnstile keys
- Production app URL

### Database Migration

Run the schema migration on your production Supabase instance before deploying.

## Testing

Visit `/test-review` for development testing of the review submission flow.

## Support

For issues and questions:
1. Check the database schema setup
2. Verify environment variables
3. Check Supabase logs for API errors
4. Review browser console for client-side errors

## License

This project is proprietary software. All rights reserved.