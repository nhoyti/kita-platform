import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { beforeEach, describe, expect, it } from 'vitest';

import { AuthService } from '../auth/auth.service';
import { authGuard, guestGuard } from './auth.guard';

interface AuthStub {
  readonly isAuthenticated: () => boolean;
  readonly waitUntilReady: () => Promise<void>;
}

describe('auth guards', () => {
  let auth: AuthStub;
  let createUrlTree: (commands: readonly unknown[], extras?: Record<string, unknown>) => UrlTree;

  beforeEach(() => {
    auth = {
      isAuthenticated: () => false,
      waitUntilReady: async () => undefined,
    };
    createUrlTree = (commands, extras) => ({ commands, extras }) as unknown as UrlTree;

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: auth },
        { provide: Router, useValue: { createUrlTree } },
      ],
    });
  });

  it('redirects unauthenticated users to login with the requested URL', async () => {
    const result = await TestBed.runInInjectionContext(() =>
      authGuard({} as ActivatedRouteSnapshot, { url: '/account' } as RouterStateSnapshot),
    );

    expect(result).toEqual({
      commands: ['/auth/login'],
      extras: { queryParams: { returnUrl: '/account' } },
    });
  });

  it('allows authenticated users through the protected guard', async () => {
    auth = { ...auth, isAuthenticated: () => true };
    TestBed.overrideProvider(AuthService, { useValue: auth });

    const result = await TestBed.runInInjectionContext(() =>
      authGuard({} as ActivatedRouteSnapshot, { url: '/account' } as RouterStateSnapshot),
    );

    expect(result).toBe(true);
  });

  it('redirects authenticated users away from guest routes', async () => {
    auth = { ...auth, isAuthenticated: () => true };
    TestBed.overrideProvider(AuthService, { useValue: auth });

      const result = await TestBed.runInInjectionContext(() =>
        guestGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot),
    );

    expect(result).toEqual({ commands: ['/account'] });
  });

  it('allows unauthenticated users into guest routes', async () => {
    const result = await TestBed.runInInjectionContext(() =>
        guestGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot),
    );

    expect(result).toBe(true);
  });
});
