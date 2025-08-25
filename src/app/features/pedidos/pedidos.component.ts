import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, Type } from '@angular/core';
import { TableBootstrapComponent } from 'src/app/shared/tables/table-bootstrap/table-bootstrap.component';
import { PedidoService } from './services/pedido.service';
import { Pedido } from 'src/app/core/models/database.type';
import { CardDashboardIconComponent } from 'src/app/shared/cards/card-dashboard-icon/card-dashboard-icon.component';
import { ButtonWithIconComponent } from 'src/app/shared/buttons/button-with-icon/button-with-icon.component';
import { getBadgeClassByEstadoPedido } from 'src/app/shared/funtions/pedidosFuntions';
import { TableNG } from 'src/app/shared/tables/table-ng/table-ng.component';
import { ToastModule } from 'primeng/toast';
import { SidebarComponent } from 'src/app/shared/sidebar/sidebar/sidebar.component';
import { PedidosFormComponent } from './pedidos-form/pedidos-form.component';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-pedidos',
  templateUrl: './pedidos.component.html',
  styleUrls: ['./pedidos.component.css'],
  standalone: true,
  imports: [
    CommonModule, // Para el pipe 'date' y *ngIf/*ngFor si los usas
    CardDashboardIconComponent, // Para poder usar <app-card-dashboard-icon>
    TableBootstrapComponent,
    ButtonWithIconComponent,
    TableNG,
    ToastModule,
    SidebarComponent,
  ],
  providers: [MessageService],
})
export class PedidosComponent implements OnInit {
  sidebarVisible = false;
  sidebarTitle = '';
  componentToLoad: Type<any> | null = null;
  sidebarInputs: Record<string, unknown> | undefined; // Para los inputs del componente dinámico
  private _pedidoService = inject(PedidoService);
  private _messageService = inject(MessageService);
  loading = false;
  error: string | null = null;
  pedidos: Pedido[] = [];

  async ngOnInit(): Promise<void> {
    this.loading = true;
    try {
      const data = await this._pedidoService.getAllPedidos();
      if (data) {
        this.pedidos = data;
      } else {
        this.pedidos = [];
      }
    } catch (error) {
      console.error(error);
    } finally {
      this.loading = false;
    }
  }
  getBadgeClass(estado: string): string {
    return getBadgeClassByEstadoPedido(estado);
  }

  openPedidoForm(): void {
    this.sidebarTitle = 'Nuevo pedido';
    this.componentToLoad = PedidosFormComponent; // <-- Cambias el componente aquí
    this.sidebarInputs = {
      // Opcional: Cuando este formulario se guarde, puedes volver al anterior o cerrar todo
      formResult: (result: { success: boolean; message: string }) =>
        this.handleFormResult(result),
    };
    this.sidebarVisible = true;
  }
  handleFormResult(result: {
    severity?: string;
    success?: boolean;
    message: string;
  }): void {
    if (!result.severity) {
      this._messageService.add({
        severity: result.success ? 'success' : 'error',
        summary: result.success ? 'Éxito' : 'Error',
        detail: result.message,
      });
    } else {
      this._messageService.add({
        severity: result.severity,
        summary: 'Info',
        detail: result.message,
      });
    }
  }
}
