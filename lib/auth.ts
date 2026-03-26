import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { supabaseAdmin } from '@/lib/db';
import type { User } from '@/types';

const SALT_ROUNDS = 12;
const TOKEN_EXPIRY = '8h';

function getJWTSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('Missing JWT_SECRET — add it to .env.local');
  }
  return secret;
}

/**
 * Hash a password using bcrypt with 12 salt rounds.
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Authenticate a user by email and password.
 * Returns user object and JWT token on success, null on failure.
 */
export async function loginUser(
  email: string,
  password: string
): Promise<{ user: User; token: string } | null> {
  try {
    // Fetch user by email
    const { data: users, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('email', email.toLowerCase().trim())
      .eq('is_active', true)
      .limit(1);

    if (error || !users || users.length === 0) {
      return null;
    }

    const user = users[0] as User;

    // Check password hash exists
    if (!user.password_hash) {
      return null;
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return null;
    }

    // Generate JWT
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      getJWTSecret(),
      { expiresIn: TOKEN_EXPIRY }
    );

    return { user, token };
  } catch (err) {
    console.error('[Auth] loginUser error:', err);
    return null;
  }
}

/**
 * Verify a JWT auth token and return the fresh user from DB.
 */
export async function verifyAuthToken(token: string): Promise<User | null> {
  try {
    const decoded = jwt.verify(token, getJWTSecret()) as {
      id: string;
      email: string;
      role: string;
    };

    // Fetch fresh user from DB
    const { data: users, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', decoded.id)
      .eq('is_active', true)
      .limit(1);

    if (error || !users || users.length === 0) {
      return null;
    }

    return users[0] as User;
  } catch {
    // JWT expired or invalid
    return null;
  }
}
