import { Component, inject, Type } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableNGPedidos } from 'src/app/shared/tables/table-ng/table-ng.component';
import { PedidoService } from '../../pedidos/services/pedido.service';
import { MessageService } from 'primeng/api';
import { ProductoPedidoFormComponent } from '../../productos/producto/producto-pedido-form/producto-pedido-form.component';
import { SidebarComponent } from 'src/app/shared/sidebar/sidebar/sidebar.component';
import { ToastModule } from 'primeng/toast';
import { PedidoItem } from 'src/app/core/models/database.type';

@Component({
  selector: 'app-confirmacion-pedidos',
  standalone: true,
  imports: [CommonModule, TableNGPedidos, SidebarComponent, ToastModule],
  templateUrl: './confirmacion-pedidos.component.html',
  styleUrls: ['./confirmacion-pedidos.component.css'],
  providers: [MessageService],
})
export class ConfirmacionPedidosComponent {
  sidebarVisible = false;
  sidebarTitle = '';
  componentToLoad: Type<any> | null = null;
  sidebarInputs: Record<string, unknown> | undefined;
  private _pedidoService = inject(PedidoService);
  private _messageService = inject(MessageService);

  openPedidoForm(itemPedido: PedidoItem): void {
    this.sidebarTitle = 'Modificaciones para OC';
    this.componentToLoad = ProductoPedidoFormComponent;
    this.sidebarInputs = {
      formResult: (result: { success: boolean; message: string }) =>
        this.handleFormResult(result),
      onSaveSuccess: () => this.handleCloseSidebar(),
      modeUser: false,
      pedidoItemOC: itemPedido,
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
  handleCloseSidebar() {
    console.log('Producto guardado, cerrando sidebar...');
    this.sidebarVisible = false;
  }
}
