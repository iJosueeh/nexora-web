import { Routes } from '@angular/router';
import { NotFound } from './features/not-found/not-found';
import { authGuard } from './core/guards/auth-guard';

export const routes: Routes = [
    {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full'
    },
    {
        path: '',
        loadComponent: () => import('./layout/main-layout/main-layout').then(m => m.MainLayout),
        children: [
            {
                path: 'home',
                loadComponent: () => import('./features/home/home').then(m => m.Home)
            },
            {
                path: 'explorar',
                loadComponent: () => import('./features/home/components/explorar/explorar').then(m => m.ExplorarPage)
            },
            {
                path: 'explorar/:slug',
                loadComponent: () => import('./features/home/components/explorar/components/research-detail/research-detail').then(m => m.ResearchDetail)
            },
            {
                path: 'pulse',
                loadComponent: () => import('./features/home/components/pulse/pulse').then(m => m.PulsePage)
            },
            {
                path: 'eventos',
                loadComponent: () => import('./features/home/components/eventos/eventos').then(m => m.EventosPage)
            },
            {
                path: 'eventos/:slug',
                loadComponent: () => import('./features/home/components/eventos/components/event-detail/event-detail').then(m => m.EventDetail)
            },
            {
                path: 'feed/notifications',
                loadComponent: () => import('./features/feed/pages/notifications-page/notifications-page').then(m => m.NotificationsPage),
                canActivate: [authGuard]
            },
            {
                path: 'feed/explore',
                loadComponent: () => import('./features/feed/pages/explore/explore-page').then(m => m.ExplorePage),
                canActivate: [authGuard]
            },
            {
                path: 'feed/bookmarks',
                loadComponent: () => import('./features/feed/pages/bookmarks/bookmarks').then(m => m.BookmarksPage),
                canActivate: [authGuard]
            },
            {
                path: 'feed',
                loadComponent: () => import('./features/feed/pages/feed-page/feed-page').then(m => m.FeedPage),
                canActivate: [authGuard]
            },
            {
                path: 'feed/post/:id',
                loadComponent: () => import('./features/feed/pages/post-detail/post-detail').then(m => m.PostDetailPage)
            },
            {
                path: 'publicar',
                loadComponent: () => import('./features/feed/pages/new-publication/new-publication-page').then(m => m.NewPublicationPage),
                canActivate: [authGuard]
            },
            {
                path: 'ayuda',
                loadComponent: () => import('./features/help/help-page').then(m => m.HelpPage)
            },
            {
                path: 'sobre-nosotros',
                loadComponent: () => import('./features/home/pages/sobre-nosotros/sobre-nosotros').then(m => m.SobreNosotrosPage)
            },
            {
                path: 'settings',
                loadComponent: () => import('./features/profile/profile-settings/profile-settings').then(m => m.ProfileSettingsPage),
                canActivate: [authGuard]
            },
            {
                path: 'profile',
                loadComponent: () => import('./features/profile/profile-page/profile-page').then(m => m.ProfilePage)
            },
            {
                path: 'u/:handle',
                loadComponent: () => import('./features/profile/profile-page/profile-page').then(m => m.ProfilePage)
            }
        ]
    },
    {
        path: 'management',
        loadComponent: () => import('./features/management/management').then(m => m.ManagementPage),
        canActivate: [() => import('./core/guards/role-guard').then(m => m.roleGuard)],
        data: { allowedRoles: ['ROLE_ADMIN', 'ROLE_OFFICIAL'] },
        children: [
            {
                path: '',
                redirectTo: 'dashboard',
                pathMatch: 'full'
            },
            {
                path: 'dashboard',
                loadComponent: () => import('./features/management/pages/dashboard/dashboard').then(m => m.DashboardView)
            },
            {
                path: 'users',
                loadComponent: () => import('./features/management/pages/users/users').then(m => m.UsersView),
                canActivate: [() => import('./core/guards/role-guard').then(m => m.roleGuard)],
                data: { allowedRoles: ['ROLE_ADMIN'] }
            },
            {
                path: 'posts',
                loadComponent: () => import('./features/management/pages/posts/posts').then(m => m.PostsView),
                canActivate: [() => import('./core/guards/role-guard').then(m => m.roleGuard)],
                data: { allowedRoles: ['ROLE_ADMIN', 'ROLE_OFFICIAL'] }
            },
            {
                path: 'maintenance',
                loadComponent: () => import('./features/management/pages/maintenance/maintenance').then(m => m.MaintenancePage),
                canActivate: [() => import('./core/guards/role-guard').then(m => m.roleGuard)],
                data: { allowedRoles: ['ROLE_ADMIN'] }
            },
            {
                path: 'events',
                loadComponent: () => import('./features/management/pages/events/events').then(m => m.EventsView),
                canActivate: [() => import('./core/guards/role-guard').then(m => m.roleGuard)],
                data: { allowedRoles: ['ROLE_ADMIN', 'ROLE_OFFICIAL'] }
            }
        ]
    },
    {
        path: '',
        loadComponent: () => import('./layout/auth-layout/auth-layout').then(m => m.AuthLayout),
        children: [
            {
                path: 'login',
                loadComponent: () => import('./features/auth/login/login').then(m => m.Login)
            },
            {
                path: 'register',
                loadComponent: () => import('./features/auth/register/register').then(m => m.Register)
            },
            {
                path: 'forgot-password',
                loadComponent: () => import('./features/auth/forgot-password/forgot-password').then(m => m.ForgotPassword)
            },
            {
                path: 'reset-password',
                loadComponent: () => import('./features/auth/reset-password/reset-password').then(m => m.ResetPassword)
            }
        ]
    },
    { path: '**', component: NotFound }
];