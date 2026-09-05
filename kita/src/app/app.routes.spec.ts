import { routes } from './app.routes';

describe('routes', () => {
  it('defines titled public routes and a not-found fallback', () => {
    expect(routes.find((route) => route.path === '')?.title).toBe('Kita | Discover');
    expect(routes.find((route) => route.path === 'about')?.title).toBe('About | Kita');
    expect(routes.find((route) => route.path === 'not-found')?.title).toBe('Page not found | Kita');
    expect(routes.at(-1)).toEqual({ path: '**', redirectTo: 'not-found' });
  });
});
