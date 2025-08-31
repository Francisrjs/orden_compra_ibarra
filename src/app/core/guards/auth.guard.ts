import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.currentUser()) {
    return true; // Si hay un usuario, permite el acceso
  }

  // Si no hay usuario, redirige al login y bloquea la ruta
  router.navigate(['/login']);
  return false;
};
