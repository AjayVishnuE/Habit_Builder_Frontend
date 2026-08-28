import { Routes } from '@angular/router';
import { Login } from './features/auth/login/login';
import { authGuard } from './core/guards/auth-guard';
import { Register } from './features/auth/register/register';
import { MainLayout } from './layouts/main-layout/main-layout';
import { Habits } from './features/habits/pages/habits/habits';
import { Profile } from './features/profile/pages/profile/profile';
import { Dashboard } from './features/dashboard/pages/dashboard/dashboard';
import { HabitDetails } from './features/habits/pages/habit-details/habit-details';
import { DiaryHome } from './features/diary/pages/diary-home/diary-home';
import { DiaryEditor } from './features/diary/pages/diary-editor/diary-editor';
import { DiaryDetails } from './features/diary/pages/diary-details/diary-details';

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
      },
      {
        path: 'habits/:id',
        component: HabitDetails,
        canActivate: [authGuard]
      },
      {
        path: 'diary',
        component: DiaryHome,
        canActivate: [authGuard]
      },
      {
        path: 'diary/new',
        component: DiaryEditor,
        canActivate: [authGuard]
      },
      {
        path: 'diary/edit/:id',
        component: DiaryEditor,
        canActivate: [authGuard]
      },
      {
        path: 'diary/:id',
        component: DiaryDetails,
        canActivate: [authGuard]
      },
    ]
  },
  {
    path: '**',
    redirectTo: 'login'
  }
];