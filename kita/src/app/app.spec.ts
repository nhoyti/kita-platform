import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { App } from './app';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter(routes)],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render the Kita navigation', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('nav')?.textContent).toContain('Discover');
    expect(compiled.querySelector('main#main-content')).toBeTruthy();
    expect(compiled.querySelector('a[href="#main-content"]')?.textContent).toContain(
      'Skip to content',
    );
    expect(compiled.querySelector('a[href="/auth/login"]')?.textContent).toContain('Log in');
    expect(compiled.querySelector('a[href="/auth/register"]')?.textContent).toContain(
      'Create an account',
    );
  });

  it('opens and closes the mobile menu with the toggle and Escape', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    const toggle = compiled.querySelector('button[aria-controls="main-menu"]') as HTMLButtonElement;
    const menu = compiled.querySelector('#main-menu') as HTMLElement;

    toggle.click();
    fixture.detectChanges();
    expect(toggle.getAttribute('aria-expanded')).toBe('true');
    expect(menu.classList.contains('hidden')).toBe(false);

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    fixture.detectChanges();
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
    expect(menu.classList.contains('hidden')).toBe(true);
  });
});
