import { ApplicationConfig, isDevMode, provideZoneChangeDetection, inject, PLATFORM_ID } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { provideStore, Store } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { AuthEffects } from './store/auth/auth.effects';
import { authFeatureKey, authReducer } from './store/auth/auth.reducer';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { localStorageSync } from 'ngrx-store-localstorage';
import { ActionReducer, MetaReducer } from '@ngrx/store';
import { isPlatformBrowser } from '@angular/common';
import { authInterceptor } from './interceptor/auth.interceptor';


// Create a factory function for the meta reducer that checks platform
export function localStorageSyncFactory(): MetaReducer<any> {
  return (reducer: ActionReducer<any>): ActionReducer<any> => {
    if (isPlatformBrowser(inject(PLATFORM_ID))) {
      return localStorageSync({
        keys: ['auth'],
        rehydrate: true,
      })(reducer);
    }
    return reducer;
  };
}

// Initialize meta reducers array
export const metaReducers: MetaReducer[] = [localStorageSyncFactory()];

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideClientHydration(),
    provideStore({ [authFeatureKey]: authReducer }, { metaReducers }),
    provideEffects(AuthEffects),
    provideHttpClient(
      withFetch(),
      withInterceptors([authInterceptor]) 
    ),
    provideStoreDevtools({
      maxAge: 25,
      logOnly: !isDevMode(),
      autoPause: true,
      trace: false,
      traceLimit: 75,
    }),
  ],
};