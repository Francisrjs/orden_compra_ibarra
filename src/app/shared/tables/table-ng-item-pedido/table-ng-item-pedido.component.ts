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
import { OrdenCompraItem, Pedido, PedidoItem } from 'src/app/core/models/database.type';
import { PedidoService } from 'src/app/features/pedidos/services/pedido.service';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { RippleModule } from 'primeng/ripple';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { RouterLink } from '@angular/router';
import { OrdenCompraService } from 'src/app/features/orden-compra/services/orden-compra.service';

@Component({
  selector: 'app-table-ng-item-pedido',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    ButtonModule,
    TagModule,
    RippleModule,
    ToastModule,
    RouterLink
  ],
  templateUrl: './table-ng-item-pedido.component.html',
  styleUrls: ['./table-ng-item-pedido.component.css'],
  providers: [MessageService],
})
export class TableNgItemPedidoComponent implements OnInit {
  @Input() modoUsuario = true; // si necesitas condicionales
  @Output() addItem = new EventEmitter<PedidoItem>();

  pedidos: Pedido[] = [];
  private _pedidoService = inject(PedidoService);
  private _ordenCompraService=inject(OrdenCompraService)
  ordenCompraItems: PedidoItem[] | null = this._ordenCompraService.itemsOC() ?? []
  items: PedidoItem[] = [];

  constructor() {
    
    effect(() => {
      const p = this._pedidoService.pedidos() ?? [];
      this.pedidos = p;
      this.ordenCompraItems = this._ordenCompraService.itemsOC() ?? [];
      const allItems: PedidoItem[] = this.pedidos
        .flatMap((p) => p.pedido_items ?? [])
        .filter(
          (it) =>
            it &&
            it.estado !== 'Pendiente' &&
            it.estado !== 'Rechazado' &&
            it.estado !== 'Aprobado' &&
            it.estado !== 'En Envio'
        );

      this.items = allItems.filter(
        item=> !this.ordenCompraItems?.map(itemOC => itemOC.id).includes((item as PedidoItem).id)
      );
    });
  }

  ngOnInit(): void {

   this._pedidoService.getAllPedidosPendientes();
  }

  onAdd(item: PedidoItem) {
    // emitir al padre
    this.addItem.emit(item);
  }

  // helper para severity del tag (copiar tu función si la tienes en otro lado)
  getStatusSeverity(status?: string) {
    switch (status) {
      case 'Aprobado parcial':
        return 'warning';
      case 'Aprobado':
        return 'success';
      case 'En Envio':
        return 'success';
      case 'Rechazado':
        return 'danger';
      case 'Pendiente':
        return 'info';
      default:
        return undefined;
    }
  }
  getNumeroPedido(idItem:PedidoItem){
    return this.pedidos.find(p=>p.pedido_items?.some(i=>i.id===idItem.id))?.numero_pedido;
  }
    getPedido_id(idItem:PedidoItem){
    return this.pedidos.find(p=>p.pedido_items?.some(i=>i.id===idItem.id))?.id;
  }
  
}
