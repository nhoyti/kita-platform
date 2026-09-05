import type { Session, User } from '@supabase/supabase-js';

export type RegistrationType = 'fan' | 'creator';

export interface AuthSessionState {
  readonly session: Session | null;
  readonly user: User | null;
  readonly ready: boolean;
}

export interface RegistrationResult {
  readonly user: User | null;
  readonly session: Session | null;
  readonly requiresEmailVerification: boolean;
}

export class AuthServiceError extends Error {
  constructor(
    message: string,
    readonly operation: string,
    readonly status?: number,
  ) {
    super(message);
    this.name = 'AuthServiceError';
  }
}
