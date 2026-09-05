import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from '../auth/auth.service';

export const authGuard: CanActivateFn = (_route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return auth.waitUntilReady().then(() =>
    auth.isAuthenticated()
      ? true
      : router.createUrlTree(['/auth/login'], {
          queryParams: { returnUrl: state.url },
        }),
  );
};

export const guestGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return auth
    .waitUntilReady()
    .then(() => (auth.isAuthenticated() ? router.createUrlTree(['/account']) : true));
};
