import { Routes } from '@angular/router';

import { HomePageComponent } from './features/home/home-page.component';
import { NotFoundPageComponent } from './features/not-found/not-found-page.component';
import { PlaceholderPageComponent } from './features/placeholder/placeholder-page.component';

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
  { path: 'not-found', component: NotFoundPageComponent, title: 'Page not found | Kita' },
  { path: '**', redirectTo: 'not-found' },
];
