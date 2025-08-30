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
import { Pedido, PedidoItem } from 'src/app/core/models/database.type';
import { PedidoService } from 'src/app/features/pedidos/services/pedido.service';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { RippleModule } from 'primeng/ripple';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

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
  ],
  templateUrl: './table-ng-item-pedido.component.html',
  styleUrls: ['./table-ng-item-pedido.component.css'],
  providers: [MessageService],
})
export class TableNgItemPedidoComponent implements OnInit {
  @Input() modoUsuario = true; // si necesitas condicionales
  @Output() addItem = new EventEmitter<PedidoItem>();

  private _pedidoService = inject(PedidoService);

  items: PedidoItem[] = [];

  constructor() {
    // React to changes in pedidos signal (or pedidoItems if exists)
    effect(() => {
      // Si tu servicio ya tiene `pedidoItems` signal, úsalo:
      // const signalExists = (this._pedidoService as any).pedidoItems;
      // if (signalExists) { this.items = (this._pedidoService as any).pedidoItems(); return; }

      // En caso contrario, derive items pendientes desde pedidos
      this._pedidoService.getAllPedidos();
      const pedidos = this._pedidoService.pedidos(); // señal existente en tu servicio
      if (!pedidos) {
        this.items = [];
        return;
      }

      const allItems: PedidoItem[] = pedidos
        .flatMap((p) => p.pedido_items ?? [])
        .filter(
          (it) =>
            it &&
            it.estado !== 'Pendiente' &&
            it.estado !== 'Rechazado' &&
            it.estado !== 'Aprobado'
        );

      this.items = allItems;
    });
  }

  ngOnInit(): void {
    // Por si quieres precargar desde el service:
    // this._pedidoService.getAllPedidos(); // si no están cargados ya
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
      case 'Rechazado':
        return 'danger';
      case 'Pendiente':
        return 'info';
      default:
        return undefined;
    }
  }
}
