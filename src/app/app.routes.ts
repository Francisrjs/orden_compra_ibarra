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
import { OrdenCompraFormComponent } from './features/orden-compra/orden-compra-form/orden-compra-form.component';
import { LoginComponent } from './features/auth/login/login.component';
import { ProveedoresDetalleComponent } from './features/proveedores/proveedores-detalle/proveedores-detalle.component';
import { ProveedoresFormComponent } from './features/proveedores/proveedores-form/proveedores-form.component';
import { OrdenCompraHomeComponent } from './features/orden-compra/orden-compra-home/orden-compra-home.component';
import { OrdenCompraDetailComponent } from './features/orden-compra/orden-compra-detail/orden-compra-detail.component';

export const routes: Routes = [
  { path: '', redirectTo: 'pedidos', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'pedidos', component: PedidosComponent },
  { path: 'pedidos/agregar', component: PedidosComponent },
  { path: 'pedido/:id', component: PedidosDetalleComponent },
  { path: 'producto/add', component: ProductoFormComponent },
  { path: 'tabla', component: TableNGPedidos },
  {
    path: 'pedido/:id/AgregarProducto',
    component: ProductoPedidoFormComponent,
  },
  { path: 'proveedores', component: ProveedoresDetalleComponent },
  { path: 'proveedores/form', component: ProveedoresFormComponent },
  //Orden de compra
  { path: 'oc/pendientes', component: ConfirmacionPedidosComponent },
  { path: 'oc', component: OrdenCompraFormComponent },
  {path: 'oc/home', component: OrdenCompraHomeComponent},
  {path: 'oc/:id',component: OrdenCompraDetailComponent},
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
