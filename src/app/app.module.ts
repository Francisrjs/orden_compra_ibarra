// Explicación: módulo principal. Declarás componentes y traés AppRoutingModule (que exporta RouterModule).
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms'; // necesario para ngModel

import { AppComponent } from './app.component';
import { CardDashboardIconComponent } from './shared/cards/card-dashboard-icon/card-dashboard-icon.component';
import { TableBootstrapComponent } from './shared/tables/table-bootstrap/table-bootstrap.component';

import { PedidosComponent } from './features/pedidos/pedidos.component';
import { PedidosDetalleComponent } from './features/pedidos/pedidos-detalle/pedidos-detalle.component';
import { PedidosFormComponent } from './features/pedidos/pedidos-form/pedidos-form.component';

import { AppRoutingModule } from './app-routing.module';
import { ButtonElegantComponent } from './shared/buttons/button-elegant/button-elegant.component';

import { ButtonWithIconComponent } from './shared/buttons/button-with-icon/button-with-icon.component';
import { InputBoxComponent } from './shared/input/input-box/input-box.component';
import { InputOptionsComponent } from './shared/input/input-options/input-group.component';
import { InputDateComponent } from './shared/input/input-date/input-date.component';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { SidebarModule } from 'primeng/sidebar';
import { SidebarComponent } from './shared/sidebar/sidebar/sidebar.component';
@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule, // incluye CommonModule internamente
    FormsModule, // para [(ngModel)]
    AppRoutingModule, // importa RouterModule.forRoot(...) desde el archivo de routing
    ReactiveFormsModule,
    RouterModule,
    CommonModule,
    PedidosFormComponent,
    TableBootstrapComponent,
    BrowserModule,
    BrowserAnimationsModule,
    SidebarComponent,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
