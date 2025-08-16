// src/app/app-routing.module.ts
// Mapea las rutas y exporta AppRoutingModule para que AppModule pueda importar RouterModule.
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { PedidosComponent } from './features/pedidos/pedidos.component';
import { PedidosFormComponent } from './features/pedidos/pedidos-form/pedidos-form.component';
import { PedidosDetalleComponent } from './features/pedidos/pedidos-detalle/pedidos-detalle.component';

const routes: Routes = [
  { path: '', redirectTo: 'pedidos', pathMatch: 'full' },
  { path: 'pedidos', component: PedidosComponent },
  { path: 'pedidos/add', component: PedidosFormComponent },
  { path: 'pedidos/:id', component: PedidosDetalleComponent },
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
