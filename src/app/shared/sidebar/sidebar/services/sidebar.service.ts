// sidebar.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface SidebarConfig {
  component: any;
  title?: string;
  data?: any;
  width?: string;
}

@Injectable({
  providedIn: 'root',
})
export class SidebarService {
  private sidebarState = new BehaviorSubject<{
    isOpen: boolean;
    config: SidebarConfig | null;
  }>({
    isOpen: false,
    config: null,
  });

  sidebarState$ = this.sidebarState.asObservable();

  open(config: SidebarConfig) {
    this.sidebarState.next({ isOpen: true, config });
  }

  close() {
    this.sidebarState.next({ isOpen: false, config: null });
  }
}
