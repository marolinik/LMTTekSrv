import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Role } from '@prisma/client';

export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

export const comparePassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword);
};

export const generateToken = (payload: { userId: string; email: string; role: Role }): string => {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error('JWT_SECRET not configured');
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return jwt.sign(payload, secret, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' } as any);
};

export const generateQuoteNumber = (): string => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `QT-${timestamp}-${random}`;
};
