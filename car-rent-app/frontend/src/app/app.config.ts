import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient,  withFetch,  withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import {provideAnimations} from '@angular/platform-browser/animations';
import { JwtInterceptor } from './core/interceptors/jwt.interceptor';
import { PLATFORM_ID, inject } from '@angular/core';
export const appConfig: ApplicationConfig = {
  providers: [provideZoneChangeDetection({ eventCoalescing: true }), provideRouter(routes), provideClientHydration(withEventReplay()),provideHttpClient(
    withFetch(), withInterceptors([(req, next) => {
      const jwtInterceptor = new JwtInterceptor();
      return jwtInterceptor.intercept(req, { handle: next });
    }])
  ),provideAnimations()]
};
