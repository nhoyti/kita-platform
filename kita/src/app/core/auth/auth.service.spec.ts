import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';

import { AuthService } from './auth.service';
import { AuthServiceError } from './auth.types';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AuthService);
  });

  it('starts ready with no session when public Supabase configuration is missing', () => {
    expect(service.ready()).toBe(true);
    expect(service.session()).toBeNull();
    expect(service.user()).toBeNull();
    expect(service.isAuthenticated()).toBe(false);
  });

  it('resolves the readiness promise after session initialization', async () => {
    await expect(service.waitUntilReady()).resolves.toBeUndefined();
  });

  it('fails auth operations without exposing a client-side secret fallback', async () => {
    await expect(service.logout()).rejects.toBeInstanceOf(AuthServiceError);
    await expect(service.logout()).rejects.toMatchObject({
      message: 'Supabase public configuration is missing.',
      operation: 'logout',
    });
  });
});
