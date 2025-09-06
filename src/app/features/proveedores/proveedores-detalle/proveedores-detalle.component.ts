import { Component, Type } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { SidebarComponent } from 'src/app/shared/sidebar/sidebar/sidebar.component';
import {
  TableGenericComponent,
  GenericTableColumn,
  GenericTableAction,
} from 'src/app/shared/tables/table-generic/table-generic.component';
import { Proveedor } from 'src/app/core/models/database.type';
import { ProveedorService } from '../services/proveedor.service';
import { ProveedoresFormComponent } from '../proveedores-form/proveedores-form.component';

@Component({
  selector: 'app-proveedores-detalle',
  standalone: true,
  imports: [CommonModule, ToastModule, SidebarComponent, TableGenericComponent],
  templateUrl: './proveedores-detalle.component.html',
  styleUrls: ['./proveedores-detalle.component.css'],
  providers: [MessageService],
})
export class ProveedoresDetalleComponent {
  sidebarVisible = false;
  sidebarTitle = '';
  componentToLoad: Type<any> | null = null;
  sidebarInputs: Record<string, unknown> | undefined;

  columns: GenericTableColumn<Proveedor>[] = [
    { field: 'nombre', header: 'Nombre', sortable: true, filter: true },
    { field: 'cuit', header: 'CUIT', sortable: true, filter: true },
    { field: 'domicilio', header: 'Domicilio', sortable: true, filter: true },
    { field: 'contacto', header: 'Contacto', sortable: true, filter: true },
    { field: 'email', header: 'Email', sortable: true, filter: true },
    { field: 'telefono', header: 'Teléfono', sortable: true, filter: true },
  ];

  actions: GenericTableAction<Proveedor>[] = [
    {
      icon: 'pi pi-eye',
      text: true,
      rounded: true,
      severity: 'info',
      onClick: (row) => this.verDetalle(row),
    },
    {
      icon: 'pi pi-pencil',
      text: true,
      rounded: true,
      severity: 'warning',
      onClick: (row) => this.editar(row),
    },
  ];

  constructor(private proveedorService: ProveedorService) {}

  serviceFn = () => this.proveedorService.getAllProveedores();

  verDetalle(row: Proveedor) {
    this.sidebarTitle = 'Detalle Proveedor';
    this.sidebarInputs = { proveedor: row };
    this.sidebarVisible = true;
  }

  editar(row: Proveedor) {
    this.sidebarTitle = 'Editar Proveedor';
    this.sidebarInputs = { proveedor: row, modo: 'edit' };
    this.sidebarVisible = true;
  }

  crear() {
    this.sidebarTitle = 'Nuevo Proveedor';

    this.sidebarVisible = true;
    this.componentToLoad = ProveedoresFormComponent;
  }
}
