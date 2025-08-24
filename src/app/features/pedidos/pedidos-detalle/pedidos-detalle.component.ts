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
import { PedidoService } from '../services/pedido.service';
import { ButtonFancyComponent } from 'src/app/shared/buttons/button-fancy/button-fancy.component';
import {
  getBadgeClassByEstadoPedido,
  getBadgeClassByPedidoItem,
} from 'src/app/shared/funtions/pedidosFuntions';
import { SplitButtonModule } from 'primeng/splitbutton';
import { MenuItem, MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ButtonWithIconComponent } from 'src/app/shared/buttons/button-with-icon/button-with-icon.component';
import { ProductoFormComponent } from '../../productos/producto/producto-form/producto-form.component';
import { SidebarService } from 'src/app/shared/sidebar/sidebar/services/sidebar.service';
import { SidebarComponent } from 'src/app/shared/sidebar/sidebar/sidebar.component';
import { ProductoPedidoFormComponent } from '../../productos/producto/producto-pedido-form/producto-pedido-form.component';
import { TimelineModule } from 'primeng/timeline';
import { SpeedDialModule } from 'primeng/speeddial';
import { TooltipModule } from 'primeng/tooltip';
interface EventItem {
  status?: string;
  color?: string;
  value?: string;
  showNumeroPedido?: boolean;
}
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
    TimelineModule,
    SpeedDialModule,
    TooltipModule,
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
  items: MenuItem[] | null = null;
  events: EventItem[];

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
    this.events = [
      {
        status: 'Pedido en Creación',
        value: 'En Creacion',
        color: 'text-secondary',
      },
      {
        status: 'En Proceso de Aprobacion',
        value: 'En Proceso de Aprobacion',
        showNumeroPedido: true,
        color: 'text-warning',
      },

      {
        status: 'Rechazado',
        value: 'Rechazado',
        color: 'text-danger',
      },
      {
        status: 'En Proceso de Entrega',
        value: 'En Proceso de Entrega',
        color: 'text-info',
      },
      {
        status: 'Pedido Cerrado',
        value: 'Cerrado',
        color: 'text-dark',
      },
    ];
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
    this.items = [
      {
        icon: 'pi pi-pencil',
        tooltip: 'Editar pedido',
        command: () => {
          this._messageService.add({
            severity: 'info',
            summary: 'Add',
            detail: 'Data Added',
          });
        },
      },
      {
        icon: 'pi pi-trash',
        command: () => {
          this._messageService.add({
            severity: 'error',
            summary: 'Delete',
            detail: 'Data Deleted',
          });
        },
      },
    ];
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
  getBadgeClass(estado?: string, itsItem?: boolean): string {
    if (estado) {
      return itsItem
        ? getBadgeClassByPedidoItem(estado)
        : getBadgeClassByEstadoPedido(estado);
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
    this._messageService.add({
      severity: 'success',
      summary: 'Éxito',
      detail: 'El producto fue eliminado del pedido correctamente ✅',
    });
  }
  editProductItem(idItemProduct: PedidoItem) {
    console.log('Editando item de producto:', idItemProduct);
    this.sidebarTitle = 'Editar Producto del Pedido';
    this.componentToLoad = ProductoPedidoFormComponent;
    this.sidebarInputs = {
      idPedidoItem: idItemProduct.id,
      idProduct: idItemProduct.producto?.id,
      cantidad: idItemProduct.cantidad,
      idMedida: idItemProduct.unidad_medida,
      razonPedido: idItemProduct.razon_pedido,
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
  isEventCompleted(eventValue: string): boolean {
    const estadoActual = this.pedido()?.estado;
    if (!estadoActual) return false;

    const indexActual = this.events.findIndex((e) => e.value === estadoActual);
    const indexEvento = this.events.findIndex((e) => e.value === eventValue);

    // Retorna true si el índice del evento es menor o igual al del estado actual
    return indexEvento <= indexActual;
  }
  showConfirm() {
    this._messageService.clear('confirm');
    this._messageService.add({
      key: 'confirm',
      sticky: true,
      severity: 'warn',
      summary: 'Estas seguro?',
      detail: 'Si haces esta acción no vas a poder editarlo',
    });
  }

  onConfirm() {
    this._messageService.clear('confirm');
    if (this.pedido()) {
      this._PedidoService.finalizarPedido(this.pedido()!.id);
    }
  }

  onReject() {
    this._messageService.clear('confirm');
  }
}
