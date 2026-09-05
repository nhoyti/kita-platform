import { computed, inject, Injectable, signal } from '@angular/core';
import type { Session, SupabaseClient, User } from '@supabase/supabase-js';

import { RegistrationResult, RegistrationType, AuthServiceError } from './auth.types';
import { SupabaseService } from '../config/supabase.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly supabase = inject(SupabaseService);
  private readonly sessionState = signal<Session | null>(null);
  private readonly readyState = signal(false);
  private readonly readyPromise: Promise<void>;
  private resolveReady!: () => void;

  readonly session = this.sessionState.asReadonly();
  readonly user = computed<User | null>(() => this.sessionState()?.user ?? null);
  readonly isAuthenticated = computed(() => this.sessionState() !== null);
  readonly ready = this.readyState.asReadonly();

  constructor() {
    this.readyPromise = new Promise<void>((resolve) => {
      this.resolveReady = resolve;
    });
    const client = this.supabase.client;

    if (!client) {
      this.markReady();
      return;
    }

    client.auth.onAuthStateChange((_event, session) => {
      this.sessionState.set(session);
      this.markReady();
    });

    void this.restoreSession(client);
  }

  waitUntilReady(): Promise<void> {
    return this.readyPromise;
  }

  async register(
    email: string,
    password: string,
    displayName: string,
    registrationType: RegistrationType,
  ): Promise<RegistrationResult> {
    const client = this.getClient('register');
    const { data, error } = await client.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayName.trim(),
          registration_type: registrationType,
        },
        emailRedirectTo: this.getRedirectUrl('/auth/verify-email'),
      },
    });

    if (error) {
      throw this.toAuthError(error, 'register');
    }

    return {
      user: data.user,
      session: data.session,
      requiresEmailVerification: Boolean(data.user && !data.user.email_confirmed_at),
    };
  }

  async login(email: string, password: string): Promise<Session> {
    const client = this.getClient('login');
    const { data, error } = await client.auth.signInWithPassword({ email, password });

    if (error) {
      throw this.toAuthError(error, 'login');
    }

    if (!data.session) {
      throw new AuthServiceError(
        'Your email address must be verified before you can log in.',
        'login',
      );
    }

    return data.session;
  }

  async logout(): Promise<void> {
    const client = this.getClient('logout');
    const { error } = await client.auth.signOut();

    if (error) {
      throw this.toAuthError(error, 'logout');
    }

    this.sessionState.set(null);
  }

  async resendEmailVerification(email: string): Promise<void> {
    const client = this.getClient('resend email verification');
    const { error } = await client.auth.resend({
      type: 'signup',
      email,
      options: { emailRedirectTo: this.getRedirectUrl('/auth/verify-email') },
    });

    if (error) {
      throw this.toAuthError(error, 'resend email verification');
    }
  }

  async requestPasswordReset(email: string): Promise<void> {
    const client = this.getClient('request password reset');
    const { error } = await client.auth.resetPasswordForEmail(email, {
      redirectTo: this.getRedirectUrl('/auth/reset-password'),
    });

    if (error) {
      throw this.toAuthError(error, 'request password reset');
    }
  }

  async updatePassword(password: string): Promise<User> {
    const client = this.getClient('update password');
    const { data, error } = await client.auth.updateUser({ password });

    if (error) {
      throw this.toAuthError(error, 'update password');
    }

    if (!data.user) {
      throw new AuthServiceError('Your password could not be updated.', 'update password');
    }

    return data.user;
  }

  private async restoreSession(client: SupabaseClient): Promise<void> {
    const { data, error } = await client.auth.getSession();

    if (error) {
      this.sessionState.set(null);
    } else {
      this.sessionState.set(data.session);
    }

    this.markReady();
  }

  private markReady(): void {
    if (this.readyState()) {
      return;
    }

    this.readyState.set(true);
    this.resolveReady();
  }

  private getClient(operation: string): SupabaseClient {
    if (!this.supabase.client) {
      throw new AuthServiceError(
        this.supabase.configurationError ?? 'Authentication is not configured.',
        operation,
      );
    }

    return this.supabase.client;
  }

  private getRedirectUrl(path: string): string {
    return `${globalThis.location.origin}${path}`;
  }

  private toAuthError(
    error: { message: string; status?: number },
    operation: string,
  ): AuthServiceError {
    return new AuthServiceError(
      this.getSafeErrorMessage(error.message, operation),
      operation,
      error.status,
    );
  }

  private getSafeErrorMessage(message: string, operation: string): string {
    const normalizedMessage = message.toLowerCase();

    if (operation === 'login' && normalizedMessage.includes('invalid login credentials')) {
      return 'The email or password is incorrect.';
    }

    if (normalizedMessage.includes('email rate limit')) {
      return 'Too many email requests. Please wait a moment and try again.';
    }

    if (normalizedMessage.includes('user already registered')) {
      return 'An account with this email already exists.';
    }

    return message;
  }
}
