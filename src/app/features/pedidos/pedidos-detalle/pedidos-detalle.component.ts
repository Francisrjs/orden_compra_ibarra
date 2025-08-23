import { CommonModule } from '@angular/common';
import {
  Component,
  effect,
  EventEmitter,
  Input,
  OnInit,
  Output,
  Type,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Pedido, PedidoItem } from 'src/app/core/models/database.type';
import { CardDashboardIconComponent } from 'src/app/shared/cards/card-dashboard-icon/card-dashboard-icon.component';
import { TableBootstrapComponent } from 'src/app/shared/tables/table-bootstrap/table-bootstrap.component';
import { PedidoService } from '../services/pedido.service';
import { ButtonFancyComponent } from 'src/app/shared/buttons/button-fancy/button-fancy.component';
import { getBadgeClassByEstadoPedido } from 'src/app/shared/funtions/pedidosFuntions';
import { SplitButton, SplitButtonModule } from 'primeng/splitbutton';
import { MenuItem, MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ButtonWithIconComponent } from 'src/app/shared/buttons/button-with-icon/button-with-icon.component';
import { ProductoFormComponent } from '../../productos/producto/producto-form/producto-form.component';
import { SidebarService } from 'src/app/shared/sidebar/sidebar/services/sidebar.service';
import { SidebarComponent } from 'src/app/shared/sidebar/sidebar/sidebar.component';
import { ProductoPedidoFormComponent } from '../../productos/producto/producto-pedido-form/producto-pedido-form.component';

@Component({
  selector: 'app-pedidos-detalle',
  templateUrl: './pedidos-detalle.component.html',
  styleUrls: ['./pedidos-detalle.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    ButtonFancyComponent,
    SplitButtonModule,
    ToastModule,
    ButtonWithIconComponent,
    SidebarComponent,
    ProductoFormComponent,
    ProductoPedidoFormComponent, // <-- FIX: Añadir el componente aquí
    ToastModule,
  ],
  providers: [MessageService],
})
export class PedidosDetalleComponent implements OnInit {
  // Sidebar
  sidebarVisible = false;
  sidebarTitle = '';
  componentToLoad: Type<any> | null = null;
  sidebarInputs: Record<string, unknown> | undefined; // Para los inputs del componente dinámico
  @Input() onSaveSuccess?: () => void;
  //
  pedido = this._PedidoService.pedido;
  pedidoItems: PedidoItem[] = [];
  loading = false;
  error = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private _PedidoService: PedidoService,
    private _messageService: MessageService,
    private _sidebarService: SidebarService
  ) {
    effect(() => {
      const currentPedido = this.pedido();
      this.pedidoItems = currentPedido?.pedido_items ?? [];

      // Debug: ver qué datos llegan
      console.log('Pedido actual:', currentPedido);
      console.log('Items del pedido:', this.pedidoItems);
    });
  }

  async ngOnInit(): Promise<void> {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (!idParam) {
      console.warn('No se recibió id en la ruta');
      this.error = true;
      return;
    }

    const id = Number(idParam);
    if (Number.isNaN(id)) {
      console.warn('id de ruta no es numérico:', idParam);
      this.error = true;
      return;
    }

    await this.loadPedido(id);
  }
  async loadPedido(id: number) {
    this.loading = true;
    this.error = false;
    try {
      const { data, error } = await this._PedidoService.getPedidoById(id);

      if (error) {
        throw new Error(
          error.message || 'Error al cargar el pedido desde la API.'
        );
      }
      if (!data) {
        throw new Error(`No se encontró un pedido con el id ${id}.`);
      }

      this.pedido.set(data);
    } catch (err: any) {
      console.error(err.message);
      this.error = true;
      this.pedido.set(null);
    } finally {
      this.loading = false;
    }
  }
  getBadgeClass(estado?: string): string {
    if (estado) {
      return getBadgeClassByEstadoPedido(estado);
    } else {
      return '';
    }
  }
  openPedidoProducto(): void {
    console.log('abriendo');
    this.sidebarTitle = 'Agregar nuevo producto a tu Pedido';
    this.componentToLoad = ProductoPedidoFormComponent;
    this.sidebarInputs = {
      onNavigateToCreateProduct: () => this.openProductoForm(),
      onSaveSuccess: () => this.handleCloseSidebar(),
      formResult: (result: {
        severity?: string;
        success: boolean;
        message: string;
      }) => this.handleFormResult(result),
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
  deleteItemPedido(idProductoPedido: number) {
    this._PedidoService.deleteProductoPedido(idProductoPedido);
  }
  saveProducto() {
    if (this.onSaveSuccess) {
      this.onSaveSuccess();
    }
  }
  handleCloseSidebar() {
    console.log('Producto guardado, cerrando sidebar...');
    this.sidebarVisible = false;
  }
  openProductoForm(): void {
    this.sidebarTitle = 'Crear Nuevo Producto';
    this.componentToLoad = ProductoFormComponent; // <-- Cambias el componente aquí
    this.sidebarInputs = {
      // Opcional: Cuando este formulario se guarde, puedes volver al anterior o cerrar todo
      onSaveSuccess: () => {
        console.log('Producto nuevo creado! Volviendo...');
        // Vuelve a abrir el formulario para agregar el producto recién creado al pedido
        this.openPedidoProducto();
      },
      formResult: (result: { success: boolean; message: string }) =>
        this.handleFormResult(result),
    };
    // No es necesario cambiar 'sidebarVisible', porque el sidebar ya está abierto.
  }
}
