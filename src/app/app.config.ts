import { ApplicationConfig, provideBrowserGlobalErrorListeners, inject } from '@angular/core';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideToastr } from 'ngx-toastr';

import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideApollo } from 'apollo-angular';
import { HttpLink } from 'apollo-angular/http';
import { InMemoryCache } from '@apollo/client';
import { from } from '@apollo/client/core';
import { setContext } from '@apollo/client/link/context';
import { API_BASE_URL, GRAPHQL_URL } from './core/tokens/api-endpoints.token';
import { AuthSession } from './core/services/auth-session';
import { SupabaseAuthService } from './core/services/supabase-auth.service';
import { authTokenInterceptor } from './core/interceptors/auth-token.interceptor';
import { environment } from '../environments/environment';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withInMemoryScrolling({ scrollPositionRestoration: 'top', anchorScrolling: 'enabled' })),
    provideAnimations(),
    provideToastr({
      timeOut: 3500,
      progressBar: true,
      closeButton: true,
      preventDuplicates: true,
      positionClass: 'toast-top-right',
    }),
    {
      provide: API_BASE_URL,
      useValue: environment.apiBaseUrl,
    },
    {
      provide: GRAPHQL_URL,
      useValue: environment.graphqlUrl,
    },
    provideHttpClient(withInterceptors([authTokenInterceptor])),
    provideApollo(() => {
      const httpLink = inject(HttpLink);
      const graphqlUrl = inject(GRAPHQL_URL);
      const authSession = inject(AuthSession);
      const supabaseAuth = inject(SupabaseAuthService);

      const authLink = setContext(async (_, context) => {
        const liveTokens = await supabaseAuth.getValidTokens();
        const accessToken = liveTokens?.accessToken ?? authSession.getTokens()?.accessToken;

        if (!accessToken) {
          return context;
        }

        return {
          headers: {
            ...(context.headers as Record<string, string> | undefined),
            Authorization: `${liveTokens?.tokenType ?? authSession.getTokens()?.tokenType ?? 'Bearer'} ${accessToken}`,
          },
        };
      });

      return {
        link: from([authLink, httpLink.create({ uri: graphqlUrl })]),
        cache: new InMemoryCache(),
      };
    }),
  ],
};
