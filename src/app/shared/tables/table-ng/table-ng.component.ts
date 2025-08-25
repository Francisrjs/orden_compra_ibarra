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
import { PrimeNGConfig } from 'primeng/api';
import { ButtonWithIconComponent } from '../../buttons/button-with-icon/button-with-icon.component';
import { ProductoService } from 'src/app/features/productos/service/producto-service.service';
import { PedidoService } from 'src/app/features/pedidos/services/pedido.service';
import {
  Areas,
  EstadoItemPedido,
  Pedido,
} from 'src/app/core/models/database.type';
import {
  getBadgeClassByEstadoPedido,
  getBadgeClassByPedidoItem,
  getIconByArea,
} from '../../funtions/pedidosFuntions';
import { AppRoutingModule } from 'src/app/app-routing.module';
import { Router, RouterLink } from '@angular/router';

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
  selector: 'app-table-ng',
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
  ],
  templateUrl: './table-ng.component.html',
  styleUrls: ['./table-ng.component.css'],
  providers: [ProductService, PrimeNGConfig],
})
export class TableNG implements OnInit {
  products!: Product[];
  @Output() openCreatePedido = new EventEmitter<void>();
  @Output() openEditPedido = new EventEmitter<Pedido>();
  private primengConfig = inject(PrimeNGConfig);
  private _productoService = inject(ProductoService);
  private _PedidoService = inject(PedidoService);
  pedidos!: Pedido[];
  pedidosSignal = this._PedidoService.pedidos;

  constructor() {
    // Usamos 'effect' para reaccionar a los cambios de la señal
    effect(() => {
      this.pedidos = this.pedidosSignal();
      console.log(this.pedidos);
      console.log('Número de pedidos actualizados:', this.pedidos.length);
    });
  }
  ngOnInit() {
    this._PedidoService.getAllPedidos().then((raw) => {
      // si los pedidos no traen id único, creamos uno temporal
      if (raw) {
        this.pedidos = raw.map((p, i) => ({
          ...p,
          id: p.id ?? p.numero_pedido ?? i,
        }));
      } else {
        this.pedidos = [];
      }
    });
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
}
