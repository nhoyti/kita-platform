export type AppRole = 'fan' | 'creator' | 'moderator' | 'admin' | 'super_admin';

export type AccountStatus = 'pending_verification' | 'active' | 'suspended' | 'banned';

export interface Profile {
  readonly id: string;
  readonly username: string | null;
  readonly display_name: string | null;
  readonly avatar_url: string | null;
  readonly bio: string | null;
  readonly role: AppRole;
  readonly account_status: AccountStatus;
  readonly created_at: string;
  readonly updated_at: string;
}

export interface ProfileUpdateInput {
  readonly username?: string | null;
  readonly display_name?: string | null;
  readonly avatar_url?: string | null;
  readonly bio?: string | null;
}

export class ProfileServiceError extends Error {
  constructor(
    message: string,
    readonly operation: string,
    readonly status?: number,
  ) {
    super(message);
    this.name = 'ProfileServiceError';
  }
}
