import { Component, Type } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { SidebarComponent } from 'src/app/shared/sidebar/sidebar/sidebar.component';

@Component({
  selector: 'app-proveedores-detalle',
  standalone: true,
  imports: [CommonModule,ToastModule,SidebarComponent],
  templateUrl: './proveedores-detalle.component.html',
  styleUrls: ['./proveedores-detalle.component.css'],
  providers:[MessageService]
})
export class ProveedoresDetalleComponent {
sidebarVisible = false;
  sidebarTitle = '';
  componentToLoad: Type<any> | null = null;
  sidebarInputs: Record<string, unknown> | undefined;


}
