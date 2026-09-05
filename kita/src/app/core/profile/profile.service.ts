import { computed, inject, Injectable, signal } from '@angular/core';
import type { SupabaseClient } from '@supabase/supabase-js';

import { AuthService } from '../auth/auth.service';
import { SupabaseService } from '../config/supabase.service';
import { Profile, ProfileServiceError, ProfileUpdateInput } from './profile.types';

const PROFILE_COLUMNS =
  'id, username, display_name, avatar_url, bio, role, account_status, created_at, updated_at';

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private readonly auth = inject(AuthService);
  private readonly supabase = inject(SupabaseService);
  private readonly profileState = signal<Profile | null>(null);
  private readonly profileOwnerId = signal<string | null>(null);

  readonly profile = computed(() =>
    this.auth.user()?.id === this.profileOwnerId() ? this.profileState() : null,
  );

  async loadCurrentProfile(): Promise<Profile | null> {
    const user = this.auth.user();

    if (!user) {
      this.clearProfile();
      return null;
    }

    const client = this.getClient('load profile');
    const { data, error } = await client
      .from('profiles')
      .select(PROFILE_COLUMNS)
      .eq('id', user.id)
      .maybeSingle<Profile>();

    if (error) {
      throw this.toProfileError(error, 'load profile');
    }

    this.profileOwnerId.set(user.id);
    this.profileState.set(data);
    return data;
  }

  async updateCurrentProfile(input: ProfileUpdateInput): Promise<Profile> {
    const user = this.auth.user();

    if (!user) {
      throw new ProfileServiceError(
        'You must be signed in to update your profile.',
        'update profile',
      );
    }

    const client = this.getClient('update profile');
    const { data, error } = await client
      .from('profiles')
      .update(this.normalizeUpdate(input))
      .eq('id', user.id)
      .select(PROFILE_COLUMNS)
      .single<Profile>();

    if (error) {
      throw this.toProfileError(error, 'update profile');
    }

    this.profileOwnerId.set(user.id);
    this.profileState.set(data);
    return data;
  }

  clearProfile(): void {
    this.profileOwnerId.set(null);
    this.profileState.set(null);
  }

  private getClient(operation: string): SupabaseClient {
    if (!this.supabase.client) {
      throw new ProfileServiceError(
        this.supabase.configurationError ?? 'Profiles are not configured.',
        operation,
      );
    }

    return this.supabase.client;
  }

  private normalizeUpdate(input: ProfileUpdateInput): ProfileUpdateInput {
    return {
      ...(input.username === undefined
        ? {}
        : { username: this.normalizeText(input.username)?.toLowerCase() ?? null }),
      ...(input.display_name === undefined
        ? {}
        : { display_name: this.normalizeText(input.display_name) }),
      ...(input.avatar_url === undefined
        ? {}
        : { avatar_url: this.normalizeText(input.avatar_url) }),
      ...(input.bio === undefined ? {} : { bio: this.normalizeText(input.bio) }),
    };
  }

  private normalizeText(value: string | null): string | null {
    const normalizedValue = value?.trim() ?? null;
    return normalizedValue || null;
  }

  private toProfileError(
    error: { message: string; code?: string; status?: number },
    operation: string,
  ): ProfileServiceError {
    if (error.code === '23505') {
      return new ProfileServiceError('That username is already in use.', operation, error.status);
    }

    if (error.code === '23514') {
      return new ProfileServiceError(
        'The profile details do not meet the required format.',
        operation,
        error.status,
      );
    }

    return new ProfileServiceError(error.message, operation, error.status);
  }
}
