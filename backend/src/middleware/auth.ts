import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../types/types'; // JWT payload type
import { User as UserModel } from '../model/profiles';

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

export const isAuthenticated = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    res.status(401).json({ message: 'No token provided' });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as User; // Assert type
    const account = await UserModel.findOne({ id: (decoded as any).id }).select('banned banReason rootOwner role canBan canDemote canManageRoles canManagePremium canManageBadges canCustomizeUsers');
    if (!account) {
      res.status(401).json({ message: 'Account not found.' });
      return;
    }
    if (account.banned) {
      res.status(403).json({ message: account.banReason ? `This account is banned: ${account.banReason}` : 'This account is banned.' });
      return;
    }
    req.user = { ...decoded, role: account.role } as any;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
    return;
  }
};
