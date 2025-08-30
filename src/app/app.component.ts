import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  HostListener,
  OnInit,
} from '@angular/core';
import { MenuItem } from 'primeng/api';
import { MenuItemContent, MenuModule } from 'primeng/menu';
import { BadgeModule } from 'primeng/badge';
import { RippleModule } from 'primeng/ripple';
import { AvatarModule } from 'primeng/avatar';
import { PanelMenuModule } from 'primeng/panelmenu';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterModule } from '@angular/router';

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
  onResize(event: any) {
    // Si la pantalla es menor a 768px (Bootstrap md), colapsa
    this.expanded = window.innerWidth >= 768;
  }
  ngOnInit() {
    this.items = [
      {
        label: 'Pedidos',
        items: [
          {
            label: 'Nuevo',
            icon: 'pi pi-plus',
            shortcut: '⌘+N',
            routerLink: '/pedidos/add', // Añadimos la ruta
          },
          {
            label: 'Mis pedidos',
            icon: 'pi pi-search',
            shortcut: '⌘+S',
            routerLink: '/pedidos', // Añadimos la ruta
          },
        ],
      },
      {
        label: 'Orden de compras',
        items: [
          {
            label: 'Pedidos pendientes',
            icon: 'pi pi-cog',
            badge: '2',
            routerLink: '/oc/pendientes',
          },
          {
            label: 'Orden de compras',
            icon: 'pi pi-inbox',
            shortcut: '⌘+O',
            routerLink: '/oc',
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
