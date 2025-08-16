import { Routes } from '@angular/router';
import { PedidosFormComponent } from './pedidos-form/pedidos-form.component';
import { PedidosDetalleComponent } from './pedidos-detalle/pedidos-detalle.component';

export const PEDIDOS_ROUTES: Routes = [
  { path: 'form', component: PedidosFormComponent },
  { path: ':id', component: PedidosDetalleComponent },
];
