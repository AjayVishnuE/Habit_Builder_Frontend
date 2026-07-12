import { Routes } from '@angular/router';
import { Login } from './features/auth/login/login';
import { Register } from './features/auth/register/register';
import { Dashboard } from './features/dashboard/pages/dashboard/dashboard';
import { Habits } from './features/habits/pages/habits/habits';
import { Profile } from './features/profile/pages/profile/profile';
import { MainLayout } from './layouts/main-layout/main-layout';
import { authGuard } from './core/guards/auth-guard';

export const routes: Routes = [
  {
    path: 'login',
    component: Login
  },
  {
    path: 'register',
    component: Register
  },
  {
    path: '',
    component: MainLayout,
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        component: Dashboard,
        canActivate: [authGuard]
      },
      {
        path: 'habits',
        component: Habits,
        canActivate: [authGuard]
      },
      {
        path: 'profile',
        component: Profile,
        canActivate: [authGuard]
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'login'
  }
];