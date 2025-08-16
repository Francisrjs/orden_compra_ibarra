import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { CardDashboardIconComponent } from 'src/app/shared/cards/card-dashboard-icon/card-dashboard-icon.component';
import { TableBootstrapComponent } from 'src/app/shared/tables/table-bootstrap/table-bootstrap.component';

@Component({
  selector: 'app-pedidos-detalle',
  templateUrl: './pedidos-detalle.component.html',
  styleUrls: ['./pedidos-detalle.component.css'],
  standalone: true,
  imports: [CommonModule],
})
export class PedidosDetalleComponent {}
