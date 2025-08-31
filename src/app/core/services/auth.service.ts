import { computed, inject, Injectable, signal } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { Router } from '@angular/router';
import { AuthError, User, Session } from '@supabase/supabase-js';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private supabase = inject(SupabaseService).supabaseClient;
  private router = inject(Router);

  currentUser = signal<User | null>(null);
  currentSession = signal<Session | null>(null);

  // Señal computada para obtener el rol del usuario fácilmente
  userRole = computed(() => this.currentUser()?.user_metadata?.['rol']);
  constructor() {
    // Escuchamos los cambios de estado de autenticación de Supabase
    this.supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        this.currentUser.set(session?.user ?? null);
        this.currentSession.set(session);
      }
      if (event === 'SIGNED_OUT') {
        this.currentUser.set(null);
        this.currentSession.set(null);
      }
    });
  }
  async signUp(
    email: string,
    password: string,
    rol: 'Usuario' | 'Compras'
  ): Promise<{ error: AuthError | null }> {
    const { data, error } = await this.supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        // ¡AQUÍ ASIGNAMOS EL ROL!
        data: {
          rol: rol,
        },
      },
    });
    return { error };
  }
  async signIn(
    email: string,
    password: string
  ): Promise<{ error: AuthError | null }> {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });
    if (!error) {
      this.router.navigate(['/pedidos']);
    }
    return { error };
  }

  async signOut(): Promise<void> {
    await this.supabase.auth.signOut();
    this.router.navigate(['/login']);
  }
  async changePassword(
    newPassword: string
  ): Promise<{ error: AuthError | null }> {
    const { data, error } = await this.supabase.auth.updateUser({
      password: newPassword,
    });
    return { error };
  }

  isUserInRole(requiredRoles: string[]): boolean {
    const role = this.userRole();
    return role ? requiredRoles.includes(role) : false;
  }
}
