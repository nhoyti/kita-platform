import { Routes } from '@angular/router';

import { HomePageComponent } from './features/home/home-page.component';
import { NotFoundPageComponent } from './features/not-found/not-found-page.component';
import { PlaceholderPageComponent } from './features/placeholder/placeholder-page.component';
import { AuthPageComponent } from './features/auth/auth-page.component';
import { authGuard, guestGuard } from './core/guards/auth.guard';
import { CreatorDashboardPageComponent } from './features/creator/creator-dashboard-page.component';
import { PublicCreatorPageComponent } from './features/creator/public-creator-page.component';

export const routes: Routes = [
  { path: '', component: HomePageComponent, title: 'Kita | Discover' },
  {
    path: 'about',
    component: PlaceholderPageComponent,
    title: 'About | Kita',
    data: { title: 'About Kita' },
  },
  {
    path: 'get-started',
    component: PlaceholderPageComponent,
    title: 'Get started | Kita',
    data: { title: 'Get started' },
  },
  {
    path: 'auth/login',
    component: AuthPageComponent,
    canActivate: [guestGuard],
    title: 'Log in | Kita',
    data: { mode: 'login' },
  },
  {
    path: 'auth/register',
    component: AuthPageComponent,
    canActivate: [guestGuard],
    title: 'Create an account | Kita',
    data: { mode: 'register' },
  },
  {
    path: 'auth/forgot-password',
    component: AuthPageComponent,
    canActivate: [guestGuard],
    title: 'Reset your password | Kita',
    data: { mode: 'forgot-password' },
  },
  {
    path: 'auth/reset-password',
    component: AuthPageComponent,
    canActivate: [authGuard],
    title: 'Choose a new password | Kita',
    data: { mode: 'reset-password' },
  },
  {
    path: 'auth/verify-email',
    component: AuthPageComponent,
    title: 'Verify your email | Kita',
    data: { mode: 'verify-email' },
  },
  {
    path: 'account',
    component: PlaceholderPageComponent,
    canActivate: [authGuard],
    title: 'Your account | Kita',
    data: { title: 'Your account' },
  },
  {
    path: 'creator/dashboard',
    component: CreatorDashboardPageComponent,
    canActivate: [authGuard],
    title: 'Creator studio | Kita',
  },
  {
    path: 'creators/:username',
    component: PublicCreatorPageComponent,
    title: 'Creator | Kita',
  },
  { path: 'not-found', component: NotFoundPageComponent, title: 'Page not found | Kita' },
  { path: '**', redirectTo: 'not-found' },
];
