import { Routes } from '@angular/router';

import { HomePageComponent } from './features/home/home-page.component';
import { NotFoundPageComponent } from './features/not-found/not-found-page.component';
import { PlaceholderPageComponent } from './features/placeholder/placeholder-page.component';
import { authGuard, guestGuard } from './core/guards/auth.guard';

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
    component: PlaceholderPageComponent,
    canActivate: [guestGuard],
    title: 'Log in | Kita',
    data: { title: 'Log in' },
  },
  {
    path: 'auth/register',
    component: PlaceholderPageComponent,
    canActivate: [guestGuard],
    title: 'Create an account | Kita',
    data: { title: 'Create an account' },
  },
  {
    path: 'auth/forgot-password',
    component: PlaceholderPageComponent,
    canActivate: [guestGuard],
    title: 'Reset your password | Kita',
    data: { title: 'Reset your password' },
  },
  {
    path: 'auth/reset-password',
    component: PlaceholderPageComponent,
    canActivate: [authGuard],
    title: 'Choose a new password | Kita',
    data: { title: 'Choose a new password' },
  },
  {
    path: 'auth/verify-email',
    component: PlaceholderPageComponent,
    title: 'Verify your email | Kita',
    data: { title: 'Verify your email' },
  },
  {
    path: 'account',
    component: PlaceholderPageComponent,
    canActivate: [authGuard],
    title: 'Your account | Kita',
    data: { title: 'Your account' },
  },
  { path: 'not-found', component: NotFoundPageComponent, title: 'Page not found | Kita' },
  { path: '**', redirectTo: 'not-found' },
];
