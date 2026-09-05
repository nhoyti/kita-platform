import { Routes } from '@angular/router';

import { HomePageComponent } from './features/home/home-page.component';
import { PlaceholderPageComponent } from './features/placeholder/placeholder-page.component';

export const routes: Routes = [
  { path: '', component: HomePageComponent },
  { path: 'about', component: PlaceholderPageComponent, data: { title: 'About Kita' } },
  { path: 'get-started', component: PlaceholderPageComponent, data: { title: 'Get started' } },
  { path: '**', redirectTo: '' },
];
