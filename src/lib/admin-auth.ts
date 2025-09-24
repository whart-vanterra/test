import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';
import { createAdminClient } from './supabase-server';
import { AdminUser, AuthUser } from './types';

const JWT_SECRET = process.env.JWT_SECRET!;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export function generateToken(user: AuthUser): string {
  return jwt.sign(
    { 
      id: user.id, 
      email: user.email, 
      name: user.name, 
      role: user.role 
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
}

export function verifyToken(token: string): AuthUser | null {
  try {
    const payload = jwt.verify(token, JWT_SECRET) as any;
    return {
      id: payload.id,
      email: payload.email,
      name: payload.name,
      role: payload.role,
    };
  } catch (error) {
    return null;
  }
}

export async function getCurrentUser(request: NextRequest): Promise<AuthUser | null> {
  const token = request.cookies.get('admin-token')?.value;
  
  if (!token) {
    return null;
  }

  const user = verifyToken(token);
  if (!user) {
    return null;
  }

  // Verify user still exists and is active in database
  const supabase = createAdminClient();
  const { data: adminUser, error } = await supabase
    .from('reviews_admin_users')
    .select('id, email, name, role, is_active')
    .eq('id', user.id)
    .eq('is_active', true)
    .single();

  if (error || !adminUser) {
    return null;
  }

  return {
    id: adminUser.id,
    email: adminUser.email,
    name: adminUser.name,
    role: adminUser.role,
  };
}

export async function authenticateUser(email: string, password: string): Promise<AuthUser | null> {
  const supabase = createAdminClient();
  
  const { data: adminUser, error } = await supabase
    .from('reviews_admin_users')
    .select('*')
    .eq('email', email.toLowerCase())
    .eq('is_active', true)
    .single();

  if (error || !adminUser) {
    return null;
  }

  const isValidPassword = await verifyPassword(password, adminUser.password_hash);
  if (!isValidPassword) {
    return null;
  }

  return {
    id: adminUser.id,
    email: adminUser.email,
    name: adminUser.name,
    role: adminUser.role,
  };
}

export function requireAuth(handler: (request: NextRequest, user: AuthUser) => Promise<Response>) {
  return async (request: NextRequest) => {
    const user = await getCurrentUser(request);
    
    if (!user) {
      return new Response(
        JSON.stringify({ success: false, error: 'Authentication required' }),
        { 
          status: 401, 
          headers: { 'Content-Type': 'application/json' } 
        }
      );
    }

    return handler(request, user);
  };
}

export function requireRole(role: 'admin' | 'super_admin') {
  return (handler: (request: NextRequest, user: AuthUser) => Promise<Response>) => {
    return requireAuth(async (request: NextRequest, user: AuthUser) => {
      if (user.role !== role && user.role !== 'super_admin') {
        return new Response(
          JSON.stringify({ success: false, error: 'Insufficient permissions' }),
          { 
            status: 403, 
            headers: { 'Content-Type': 'application/json' } 
          }
        );
      }

      return handler(request, user);
    });
  };
}

export async function createAdminUser(userData: {
  email: string;
  name: string;
  password: string;
  role: 'admin' | 'super_admin';
}): Promise<AdminUser> {
  const supabase = createAdminClient();
  
  const passwordHash = await hashPassword(userData.password);
  
  const { data, error } = await supabase
    .from('reviews_admin_users')
    .insert({
      email: userData.email.toLowerCase(),
      name: userData.name,
      password_hash: passwordHash,
      role: userData.role,
      is_active: true,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create admin user: ${error.message}`);
  }

  return data;
}

export async function updateAdminUserPassword(userId: string, newPassword: string): Promise<void> {
  const supabase = createAdminClient();
  
  const passwordHash = await hashPassword(newPassword);
  
  const { error } = await supabase
    .from('reviews_admin_users')
    .update({ password_hash: passwordHash })
    .eq('id', userId);

  if (error) {
    throw new Error(`Failed to update password: ${error.message}`);
  }
}

export async function generateResetToken(email: string): Promise<string | null> {
  const supabase = createAdminClient();
  
  // Check if user exists
  const { data: user, error } = await supabase
    .from('reviews_admin_users')
    .select('id')
    .eq('email', email.toLowerCase())
    .eq('is_active', true)
    .single();

  if (error || !user) {
    return null; // Don't reveal if user exists
  }

  // Generate reset token
  const resetToken = jwt.sign(
    { userId: user.id, type: 'password-reset' },
    JWT_SECRET,
    { expiresIn: '1h' }
  );

  const resetTokenExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  // Save reset token to database
  const { error: updateError } = await supabase
    .from('reviews_admin_users')
    .update({
      reset_token: resetToken,
      reset_token_expires: resetTokenExpires.toISOString(),
    })
    .eq('id', user.id);

  if (updateError) {
    throw new Error(`Failed to generate reset token: ${updateError.message}`);
  }

  return resetToken;
}

export async function verifyResetToken(token: string): Promise<string | null> {
  try {
    const payload = jwt.verify(token, JWT_SECRET) as any;
    
    if (payload.type !== 'password-reset') {
      return null;
    }

    const supabase = createAdminClient();
    
    // Verify token exists in database and hasn't expired
    const { data: user, error } = await supabase
      .from('reviews_admin_users')
      .select('id, reset_token_expires')
      .eq('reset_token', token)
      .single();

    if (error || !user) {
      return null;
    }

    if (new Date() > new Date(user.reset_token_expires)) {
      return null; // Token expired
    }

    return user.id;
  } catch (error) {
    return null;
  }
}

export async function resetPassword(token: string, newPassword: string): Promise<boolean> {
  const userId = await verifyResetToken(token);
  
  if (!userId) {
    return false;
  }

  const supabase = createAdminClient();
  
  const passwordHash = await hashPassword(newPassword);
  
  const { error } = await supabase
    .from('reviews_admin_users')
    .update({
      password_hash: passwordHash,
      reset_token: null,
      reset_token_expires: null,
    })
    .eq('id', userId);

  if (error) {
    throw new Error(`Failed to reset password: ${error.message}`);
  }

  return true;
}
