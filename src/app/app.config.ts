import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
// import { AuthEffects } from './store/auth/auth.effects';
// import { authsFeature } from './store//auth/auth.reducer';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }), 
    provideRouter(routes), provideClientHydration(), 
    provideStore({}),
    // provideStore({ [authsFeature.name]: authsFeature.reducer }),
    // provideEffects(AuthEffects),
  ]
};
