import { Routes } from '@angular/router';
import { RouteMarker } from './route-marker';

export const routes: Routes = [
  { path: '', component: RouteMarker, data: { view: 'landing' } },
  { path: 'compose', component: RouteMarker, data: { view: 'compose' } },
  { path: 'landscape', component: RouteMarker, data: { view: 'landscape' } },
  { path: '**', redirectTo: '' },
];
