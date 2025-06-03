import jwt from 'jsonwebtoken';
import { UserPayload } from '../types/user';

export const generateToken = (payload: UserPayload): string => {
  return jwt.sign(payload, process.env.JWT_SECRET!, {
    expiresIn: process.env.JWT_EXPIRE as jwt.SignOptions['expiresIn'],
  });
};

export const generateRefreshToken = (payload: UserPayload): string => {
  return jwt.sign(payload, process.env.JWT_SECRET!, {
    expiresIn: process.env.JWT_REFRESH_EXPIRE as jwt.SignOptions['expiresIn'],
  });
};
export const verifyToken = (token: string): UserPayload => {
  return jwt.verify(token, process.env.JWT_SECRET!) as UserPayload;
};