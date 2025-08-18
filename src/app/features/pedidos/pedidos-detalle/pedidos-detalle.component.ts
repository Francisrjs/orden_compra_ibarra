import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Pedido } from 'src/app/core/models/database.type';
import { CardDashboardIconComponent } from 'src/app/shared/cards/card-dashboard-icon/card-dashboard-icon.component';
import { TableBootstrapComponent } from 'src/app/shared/tables/table-bootstrap/table-bootstrap.component';
import { PedidoService } from '../services/pedido.service';
import { ButtonFancyComponent } from 'src/app/shared/buttons/button-fancy/button-fancy.component';
import { getBadgeClassByEstadoPedido } from 'src/app/shared/funtions/pedidosFuntions';

@Component({
  selector: 'app-pedidos-detalle',
  templateUrl: './pedidos-detalle.component.html',
  styleUrls: ['./pedidos-detalle.component.css'],
  standalone: true,
  imports: [CommonModule, ButtonFancyComponent],
})
export class PedidosDetalleComponent implements OnInit {
  pedido: Pedido | null = null;
  loading = false;
  error = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private _PedidoService: PedidoService
  ) {}

  ngOnInit(): void {
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

    this.loadPedido(id);
  }
  async loadPedido(id: number) {
    this.loading = true;
    this.error = false;
    try {
      const { data, error } = await this._PedidoService.getPedidoById(id);

      if (error) {
        console.error('Error cargando pedido:', error);
        this.error = true;
        return;
      }

      if (!data) {
        console.warn('No se encontró la solicitud con id', id);
        this.pedido = null;
        this.error = true;
        return;
      }

      this.pedido = data;
    } catch (err) {
      console.error('Error general del try/catch:', err);
      this.error = true;
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
}
