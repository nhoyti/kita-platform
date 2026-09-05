import { routes } from './app.routes';

describe('routes', () => {
  it('defines titled public routes and a not-found fallback', () => {
    expect(routes.find((route) => route.path === '')?.title).toBe('Kita | Discover');
    expect(routes.find((route) => route.path === 'about')?.title).toBe('About | Kita');
    expect(routes.find((route) => route.path === 'not-found')?.title).toBe('Page not found | Kita');
    expect(routes.at(-1)).toEqual({ path: '**', redirectTo: 'not-found' });
  });

  it('protects authenticated routes and keeps auth entry points guest-only', () => {
    expect(routes.find((route) => route.path === 'account')?.canActivate).toHaveLength(1);
    expect(routes.find((route) => route.path === 'auth/reset-password')?.canActivate).toHaveLength(
      1,
    );
    expect(routes.find((route) => route.path === 'auth/login')?.canActivate).toHaveLength(1);
    expect(routes.find((route) => route.path === 'auth/register')?.canActivate).toHaveLength(1);
    expect(routes.find((route) => route.path === 'auth/forgot-password')?.canActivate).toHaveLength(
      1,
    );
    expect(routes.find((route) => route.path === 'auth/verify-email')?.canActivate).toBeUndefined();
  });
});
