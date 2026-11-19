// src/types/express.d.ts
import AuthUser from '@/components/user/authUser.class.js';

declare global {
  namespace Express {
    interface Request {
      validatedQuery?: any;
      id?: string;
      user?: AuthUser;
      customer?: {
        id: string;
      };
    }
  }
}

export {};
