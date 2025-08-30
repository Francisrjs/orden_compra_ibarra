import {
  Component,
  effect,
  inject,
  Input,
  OnInit,
  Output,
  EventEmitter,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { ProductService } from './productService'; // Asegúrate que la ruta sea correcta

// PrimeNG Módulos
import { Table, TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { RippleModule } from 'primeng/ripple';
import {
  ConfirmationService,
  ConfirmEventType,
  MessageService,
  PrimeNGConfig,
} from 'primeng/api';
import { ButtonWithIconComponent } from '../../buttons/button-with-icon/button-with-icon.component';
import { ProductoService } from 'src/app/features/productos/service/producto-service.service';
import { PedidoService } from 'src/app/features/pedidos/services/pedido.service';
import {
  Areas,
  EstadoItemPedido,
  Pedido,
  PedidoItem,
} from 'src/app/core/models/database.type';
import {
  getBadgeClassByEstadoPedido,
  getBadgeClassByPedidoItem,
  getIconByArea,
} from '../../funtions/pedidosFuntions';

import { Router, RouterLink } from '@angular/router';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { InputBoxComponent } from '../../input/input-box/input-box.component';

// Interfaz actualizada: sin 'rating' y con 'orders' para la expansión de fila
export interface Product {
  id?: string;
  code?: string;
  name?: string;
  description?: string;
  price?: number;
  quantity?: number;
  inventoryStatus?: string;
  category?: string;
  image?: string;
  orders?: any[]; // Necesario para la tabla anidada
}

@Component({
  selector: 'app-table-ng-pedidos',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    TagModule,
    RippleModule,
    ButtonWithIconComponent,
    RouterLink,
    ToastModule,
    ConfirmDialogModule,
    InputBoxComponent,
  ],
  templateUrl: './table-ng.component.html',
  styleUrls: ['./table-ng.component.css'],
  providers: [
    ProductService,
    PrimeNGConfig,
    MessageService,
    ConfirmationService,
  ],
})
export class TableNGPedidos implements OnInit {
  @Output() openCreatePedido = new EventEmitter<void>();
  @Output() openEditPedido = new EventEmitter<Pedido>();
  @Input() modoUsuario?: boolean = true;
  @Input() filtroPedidos: string = '';
  @Output() openEditPedidoOC = new EventEmitter<PedidoItem>();
  private primengConfig = inject(PrimeNGConfig);
  private _PedidoService = inject(PedidoService);
  private _confirmationService = inject(ConfirmationService);
  private _messageService = inject(MessageService);
  pedidos!: Pedido[];
  products!: Product[];
  pedidosSignal = this._PedidoService.pedidos;

  //Message
  messageHeader: string = '';
  message: string = '';
  razonRechazo: boolean = true;
  justificacionRechazo: string = '';
  constructor() {
    // Usamos 'effect' para reaccionar a los cambios de la señal
    effect(() => {
      this.pedidos = this.pedidosSignal();
      console.log(this.pedidos);
      console.log('Número de pedidos actualizados:', this.pedidos.length);
    });
  }
  ngOnInit() {
    this.cargarPedidos();
    this.configurarTraducciones();
  }
  async cargarPedidos() {
    let raw: Pedido[] | null = [];
    switch (this.filtroPedidos) {
      case 'usuario':
        // raw = await this._PedidoService.getPedidosByUsuario('USUARIO_ID');
        break;
      case 'pedidos_pendientes':
        raw = await this._PedidoService.getAllPedidosPendientes();
        console.log('pedidos pendientes');
        break;
      case 'todos':
        raw = await this._PedidoService.getAllPedidos();
        break;
      default:
        raw = await this._PedidoService.getAllPedidos();
        break;
    }
    this.pedidos =
      raw?.map((p, i) => ({
        ...p,
        id: p.id ?? p.numero_pedido ?? i,
      })) ?? [];
  }
  getSeverity(status: string) {
    switch (status) {
      case 'INSTOCK':
        return 'success';
      case 'LOWSTOCK':
        return 'warning';
      case 'OUTOFSTOCK':
        return 'danger';
      default:
        return undefined;
    }
  }

  getStatusSeverity(status: EstadoItemPedido) {
    switch (status) {
      case 'Aprobado parcial':
        return 'warning';
      case 'Aprobado':
        return 'success';
      case 'Rechazado':
        return 'danger';
      case 'Pendiente':
        return 'info';
      default:
        return undefined;
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

  public getIconByAreaWrapper(area: Areas): string {
    return getIconByArea(area);
  }
  clear(table: Table) {
    table.clear();
  }
  applyGlobalFilter(event: Event, table: Table) {
    const filterValue = (event.target as HTMLInputElement).value;
    table.filterGlobal(filterValue, 'contains');
  }
  requestAddPedido() {
    this.openCreatePedido.emit();
  }

  requestEditPedido(pedido: Pedido) {
    this.openEditPedido.emit(pedido);
  }
  requestEditPedidoOC(pedidoItem: PedidoItem) {
    console.log(pedidoItem);
    this.openEditPedidoOC.emit(pedidoItem);
  }

  configurarTraducciones() {
    this.primengConfig.setTranslation({
      //Filtro de Columnas
      startsWith: 'Comienza con',
      contains: 'Contiene',
      notContains: 'No contiene',
      endsWith: 'Termina con',
      equals: 'Igual a',
      notEquals: 'No es igual a',
      noFilter: 'Sin filtro',
      lt: 'Menor que',
      lte: 'Menor o igual que',
      gt: 'Mayor que',
      gte: 'Mayor o igual que',
      dateIs: 'La fecha es',
      dateIsNot: 'La fecha no es',
      dateBefore: 'La fecha es anterior a',
      dateAfter: 'La fecha es posterior a',

      // Botones genéricos de los filtros
      clear: 'Limpiar',
      apply: 'Aplicar',

      // Para filtros con reglas múltiples
      matchAll: 'Coincidir con todos',
      matchAny: 'Coincidir con cualquiera',
      addRule: 'Añadir regla',
      removeRule: 'Eliminar regla',

      // También puedes añadir otras traducciones aquí
      // Por ejemplo, para el paginador:
      // first: 'Primero',
      // last: 'Último',
      // next: 'Siguiente',
      // previous: 'Anterior',
      // ...y muchas más
    });
  }
  confirmarMensaje(
    newHeader: string,
    newMessage: string,
    razon?: boolean,
    itemPedido?: PedidoItem
  ) {
    this.messageHeader = newHeader;
    this.message = newMessage;
    if (razon) {
      this.razonRechazo = razon;
    }
    this._confirmationService.confirm({
      accept: () => {
        this._messageService.add({
          severity: 'info',
          summary: 'Confirmed',
          detail: 'You have accepted',
        });
        if (this.razonRechazo && itemPedido) {
          this.rechazarPedidoItem(itemPedido);
        }
      },
      reject: (type: ConfirmEventType) => {
        switch (type) {
          case ConfirmEventType.REJECT:
            this._messageService.add({
              severity: 'error',
              summary: 'Rejected',
              detail: 'You have rejected',
            });
            break;
          case ConfirmEventType.CANCEL:
            this._messageService.add({
              severity: 'warn',
              summary: 'Cancelled',
              detail: 'You have cancelled',
            });
            break;
        }
        this.razonRechazo = false;
      },
    });
  }
  async confirmarPedidoItem(pedidoItem: PedidoItem) {
    try {
      const { data, error } = await this._PedidoService.aceptarPedidoItem(
        pedidoItem.id
      );
      if (error) throw error;

      this._messageService.add({
        severity: 'success',
        summary: 'Pedido aceptado',
        detail: `El ítem #${pedidoItem.id} fue aceptado correctamente.`,
      });
    } catch (err: any) {
      this._messageService.add({
        severity: 'error',
        summary: 'Error al aceptar',
        detail: err.message ?? 'No se pudo aceptar el pedido.',
      });
    }
  }

  async rechazarPedidoItem(pedidoItem: PedidoItem) {
    try {
      const { data, error } = await this._PedidoService.rechazarPedidoItem(
        pedidoItem.id,
        this.justificacionRechazo
      );
      if (error) throw error;

      this._messageService.add({
        severity: 'warn',
        summary: 'Pedido rechazado',
        detail: `El ítem #${pedidoItem.id} fue rechazado.`,
      });
    } catch (err: any) {
      this._messageService.add({
        severity: 'error',
        summary: 'Error al rechazar',
        detail: err.message ?? 'No se pudo rechazar el pedido.',
      });
    }
  }

  async aceptarParcialPedidoItem(pedidoItem: PedidoItem) {
    try {
      const { data, error } =
        await this._PedidoService.aceptarParcialPedidoItem(pedidoItem.id);
      if (error) throw error;

      this._messageService.add({
        severity: 'info',
        summary: 'Aceptación parcial',
        detail: `El ítem #${pedidoItem.id} fue aceptado parcialmente.`,
      });
    } catch (err: any) {
      this._messageService.add({
        severity: 'error',
        summary: 'Error al aceptar parcialmente',
        detail: err.message ?? 'No se pudo aceptar parcialmente el pedido.',
      });
    }
  }
  confirm2() {
    this._confirmationService.confirm({
      message: 'Queres rechazar este pedido?',
      header: 'Rechazar pedido',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this._messageService.add({
          severity: 'info',
          summary: 'Aceptación',
          detail: 'El pedido se cambio de estado a RECHAZADO.',
        });
      },
      reject: (type: ConfirmEventType) => {
        switch (type) {
          case ConfirmEventType.REJECT:
            this._messageService.add({
              severity: 'error',
              summary: 'Rechazado',
              detail: 'Volviendo..',
            });
            break;
          case ConfirmEventType.CANCEL:
            this._messageService.add({
              severity: 'warn',
              summary: 'Cancelado',
              detail: 'Cancelado',
            });
            break;
          // También podrías considerar un caso `default` si quieres manejar otros tipos.
        }
      },
    });
  }
}
