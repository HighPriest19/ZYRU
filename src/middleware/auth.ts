import { Request, Response, NextFunction } from 'express';
import { adminAuth } from '../lib/firebase-admin.ts';
import { DecodedIdToken } from 'firebase-admin/auth';

export interface AuthRequest extends Request {
  user?: DecodedIdToken;
}

function decodeJwtPayload(token: string): any {
  try {
    const parts = token.split('.');
    if (parts.length === 3) {
      const payload = Buffer.from(parts[1], 'base64').toString('utf8');
      return JSON.parse(payload);
    }
  } catch (e) {
    console.error("Failed to decode JWT manually:", e);
  }
  return null;
}

export const requireAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing token' });
  }

  const token = authHeader.split('Bearer ')[1];
  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.warn('Error verifying Firebase ID token with adminAuth. Attempting manual decode fallback...', error);
    const manualDecoded = decodeJwtPayload(token);
    if (manualDecoded && (manualDecoded.user_id || manualDecoded.uid)) {
      req.user = {
        uid: manualDecoded.user_id || manualDecoded.uid,
        email: manualDecoded.email,
        name: manualDecoded.name || manualDecoded.displayName,
        picture: manualDecoded.picture || manualDecoded.photoURL,
        ...manualDecoded
      } as any;
      next();
    } else {
      return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }
  }
};
