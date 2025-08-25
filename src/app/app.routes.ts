// src/app/app-routing.module.ts
// Mapea las rutas y exporta AppRoutingModule para que AppModule pueda importar RouterModule.
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { PedidosComponent } from './features/pedidos/pedidos.component';
import { PedidosFormComponent } from './features/pedidos/pedidos-form/pedidos-form.component';
import { PedidosDetalleComponent } from './features/pedidos/pedidos-detalle/pedidos-detalle.component';
import { ProductoFormComponent } from './features/productos/producto/producto-form/producto-form.component';
import { ProductoPedidoFormComponent } from './features/productos/producto/producto-pedido-form/producto-pedido-form.component';
import { TableNGPedidos } from './shared/tables/table-ng/table-ng.component';
import { ConfirmacionPedidosComponent } from './features/orden-compra/confirmacion-pedidos/confirmacion-pedidos.component';

export const routes: Routes = [
  { path: '', redirectTo: 'pedidos', pathMatch: 'full' },
  //Pedidos
  { path: 'pedidos', component: PedidosComponent },
  { path: 'pedidos/add', component: PedidosFormComponent },
  { path: 'pedido/:id', component: PedidosDetalleComponent },
  { path: 'producto/add', component: ProductoFormComponent },
  { path: 'tabla', component: TableNGPedidos },
  {
    path: 'pedido/:id/AgregarProducto',
    component: ProductoPedidoFormComponent,
  },
  //Orden de compra
  { path: 'oc/pedidos', component: ConfirmacionPedidosComponent },
  { path: '**', redirectTo: 'pedidos' },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes), // <-- registra rutas en la app
  ],
  exports: [
    RouterModule, // <-- exporta RouterModule para que AppModule lo tenga
  ],
})
export class AppRoutingModule {} // <-- NOMBRE EXACTO: AppRoutingModule
