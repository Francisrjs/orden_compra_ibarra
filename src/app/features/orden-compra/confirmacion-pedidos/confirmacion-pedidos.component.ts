import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableNGPedidos } from 'src/app/shared/tables/table-ng/table-ng.component';

@Component({
  selector: 'app-confirmacion-pedidos',
  standalone: true,
  imports: [CommonModule, TableNGPedidos],
  templateUrl: './confirmacion-pedidos.component.html',
  styleUrls: ['./confirmacion-pedidos.component.css'],
})
export class ConfirmacionPedidosComponent {}
