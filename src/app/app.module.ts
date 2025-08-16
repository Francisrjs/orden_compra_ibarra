import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { CardDashboardIconComponent } from './shared/cards/card-dashboard-icon/card-dashboard-icon.component';
import { PedidosComponent } from './features/pedidos/pedidos.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableBootstrapComponent } from './shared/tables/table-bootstrap/table-bootstrap.component';
import { PedidosFormComponent } from './features/pedidos/pedidos-form/pedidos-form.component';
import { PedidosDetalleComponent } from './features/pedidos-detalle/pedidos-detalle.component';

@NgModule({
  declarations: [
    AppComponent,
    PedidosComponent,
    CardDashboardIconComponent,
    TableBootstrapComponent,
    PedidosFormComponent,
    PedidosDetalleComponent,
  ],
  imports: [BrowserModule, CommonModule, FormsModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
