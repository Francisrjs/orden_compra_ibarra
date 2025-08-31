import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  HostListener,
  inject,
  OnInit,
} from '@angular/core';
import { MenuItem } from 'primeng/api';
import { MenuItemContent, MenuModule } from 'primeng/menu';
import { BadgeModule } from 'primeng/badge';
import { RippleModule } from 'primeng/ripple';
import { AvatarModule } from 'primeng/avatar';
import { PanelMenuModule } from 'primeng/panelmenu';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterModule } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true, // ¡Importante! Hacemos el componente standalone
  imports: [
    CommonModule,
    RouterModule,
    MenuModule,
    AvatarModule,
    BadgeModule,
    RippleModule,
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  @HostListener('window:resize', ['$event'])
  window = window;
  items: MenuItem[] = []; // Inicializamos como array vacío
  expanded = false;
  private router = inject(Router);
  onResize(event: any) {
    // Si la pantalla es menor a 768px (Bootstrap md), colapsa
    this.expanded = window.innerWidth >= 768;
  }
  ngOnInit() {
    this.expanded = false;
    this.items = [
      {
        label: 'Pedidos',
        items: [
          {
            label: 'Nuevo',
            icon: 'pi pi-plus',
            shortcut: '⌘+N',

            command: () => {
              this.router.navigate(['/pedidos'], {
                queryParams: { agregar: true },
              });
            },
            routerLink: '',
          },
          {
            label: 'Mis pedidos',
            icon: 'pi pi-search',
            shortcut: '⌘+S',
            routerLink: '/pedidos',
          },
        ],
      },
      {
        label: 'Orden de compra',
        items: [
          {
            label: 'Nueva',
            icon: 'pi pi-plus',
            shortcut: '⌘+O',
            routerLink: '/oc',
          },
          {
            label: 'Pedidos pendientes',
            icon: 'pi pi-stopwatch',
            badge: '2',
            routerLink: '/oc/pendientes',
          },
          {
            label: 'Ordenes',
            icon: 'pi pi-file',
            shortcut: '⌘+O',
            routerLink: '/oc',
          },
        ],
      },
      {
        label: 'Francis Rojas',
        items: [
          {
            label: 'Perfil',
            icon: 'pi pi-user',
            badge: '2',
            routerLink: '/oc/pendientes',
          },
          {
            label: 'Logout',
            icon: 'pi pi-sign-out',
            shortcut: '⌘+Q',
          },
        ],
      },
    ];
    this.expanded = window.innerWidth >= 768;
  }
}
