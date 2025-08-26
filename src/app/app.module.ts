// src/app/app.module.ts
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppRoutingModule } from './app.routes';
import { AppComponent } from './app.component';

// Importa los módulos de PrimeNG
import { PanelMenuModule } from 'primeng/panelmenu';
import { SidebarModule } from 'primeng/sidebar';
import { ButtonModule } from 'primeng/button';
import { SharedModule } from 'primeng/api';

// Importa tu SharedModule si lo creas

@NgModule({
  declarations: [],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,

    // Módulos de PrimeNG
    PanelMenuModule,
    SidebarModule,
    ButtonModule,

    // Importa el módulo compartido en lugar de los componentes
  ],
  providers: [],
  bootstrap: [],
})
export class AppModule {}
