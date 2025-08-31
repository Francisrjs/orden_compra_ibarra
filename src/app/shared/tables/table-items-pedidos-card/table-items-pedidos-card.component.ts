import {
  Component,
  effect,
  inject,
  Input,
  OnInit,
  Output,
  Type,
  EventEmitter,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MenuItem, MessageService } from 'primeng/api';
import { PedidoService } from 'src/app/features/pedidos/services/pedido.service';
import { SidebarService } from '../../sidebar/sidebar/services/sidebar.service';
import { Pedido, PedidoItem } from 'src/app/core/models/database.type';
import { ProductoPedidoFormComponent } from 'src/app/features/productos/producto/producto-pedido-form/producto-pedido-form.component';
import { ProductoFormComponent } from 'src/app/features/productos/producto/producto-form/producto-form.component';
import {
  getBadgeClassByEstadoPedido,
  getBadgeClassByPedidoItem,
} from '../../funtions/pedidosFuntions';
import { ButtonWithIconComponent } from '../../buttons/button-with-icon/button-with-icon.component';
import { SidebarComponent } from '../../sidebar/sidebar/sidebar.component';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-table-items-pedidos-card',
  standalone: true,
  imports: [
    CommonModule,
    ButtonWithIconComponent,
    ButtonWithIconComponent,
    FormsModule,
  ],
  templateUrl: './table-items-pedidos-card.component.html',
  styleUrls: ['./table-items-pedidos-card.component.css'],
})
export class TableItemsPedidosCardComponent implements OnChanges {
  @Output() openCreateItem = new EventEmitter<void>();
  @Output() openEditItem = new EventEmitter<PedidoItem>();
  @Output() deleteItem = new EventEmitter<PedidoItem>();
  @Output() finalizarPedido = new EventEmitter<void>();
  //
  @Input() pedido: Pedido | null = null;
  private listaCompletaItems: PedidoItem[] = []; // 2. Guardará la lista original
  public pedidoItems: PedidoItem[] = []; // La lista filtrada que se muestra
  public searchTerm: string = ''; // El texto del input de búsqueda

  ngOnChanges(changes: SimpleChanges): void {
    // Verifica si la propiedad 'pedido' ha cambiado
    if (changes['pedido'] && this.pedido) {
      // Asigna los items del pedido a la variable local
      this.pedidoItems = this.pedido.pedido_items ?? [];
      this.listaCompletaItems = this.pedido.pedido_items ?? [];
      this.filterItems(); // Llama al filtro para mostrar la lista inicial
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
    console.log(this.pedido);
    this.openCreateItem.emit();
  }

  deleteItemPedido(item: PedidoItem) {
    this.deleteItem.emit(item);
  }

  editProductItem(ItemProduct: PedidoItem) {
    this.openEditItem.emit(ItemProduct);
  }
  finalizar(): void {
    this.finalizarPedido.emit();
  }

  filterItems(): void {
    if (!this.searchTerm || this.searchTerm.trim() === '') {
      // Si no hay texto de búsqueda, muestra todos los items
      this.pedidoItems = [...this.listaCompletaItems];
    } else {
      // Si hay texto, filtra la lista completa
      const terminoBusqueda = this.searchTerm.toLowerCase();
      this.pedidoItems = this.listaCompletaItems.filter((item) =>
        item.producto?.nombre.toLowerCase().includes(terminoBusqueda)
      );
    }
  }
}
