import { Component, Input, Type } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarModule } from 'primeng/sidebar';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { CardDashboardIconComponent } from 'src/app/shared/cards/card-dashboard-icon/card-dashboard-icon.component';
import { SidebarComponent } from 'src/app/shared/sidebar/sidebar/sidebar.component';

@Component({
  selector: 'app-orden-compra-home',
  standalone: true,
  imports: [CommonModule,SidebarComponent, ToastModule, CardDashboardIconComponent],
  templateUrl: './orden-compra-home.component.html',
  styleUrls: ['./orden-compra-home.component.css'],
  providers: [MessageService]
})
export class OrdenCompraHomeComponent {
  sidebarVisible = false;
  sidebarTitle = '';
  componentToLoad: Type<any> | null = null;
  sidebarInputs: Record <string, unknown> | undefined; 
  @Input() onSaveSuccess?: () => void;
}
