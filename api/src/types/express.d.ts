/**
 * Express Request/Response Type Extensions
 */

declare global {
  namespace Express {
    interface Request {
      userId?: string;
      userEmail?: string;
      id?: string;
    }
  }
}

export {};
