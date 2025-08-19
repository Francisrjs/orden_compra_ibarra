import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Pedido, PedidoItem } from 'src/app/core/models/database.type';
import { CardDashboardIconComponent } from 'src/app/shared/cards/card-dashboard-icon/card-dashboard-icon.component';
import { TableBootstrapComponent } from 'src/app/shared/tables/table-bootstrap/table-bootstrap.component';
import { PedidoService } from '../services/pedido.service';
import { ButtonFancyComponent } from 'src/app/shared/buttons/button-fancy/button-fancy.component';
import { getBadgeClassByEstadoPedido } from 'src/app/shared/funtions/pedidosFuntions';
import { SplitButton, SplitButtonModule } from 'primeng/splitbutton';
import { MenuItem, MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ButtonWithIconComponent } from 'src/app/shared/buttons/button-with-icon/button-with-icon.component';

@Component({
  selector: 'app-pedidos-detalle',
  templateUrl: './pedidos-detalle.component.html',
  styleUrls: ['./pedidos-detalle.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    ButtonFancyComponent,
    // 👈 Añade SplitButtonModule aquí
    SplitButtonModule,
    // 👈 Y ToastModule si vas a usar p-toast para mostrar los mensajes
    ToastModule,
    ButtonWithIconComponent,
  ],
  providers: [MessageService],
})
export class PedidosDetalleComponent implements OnInit {
  pedido: Pedido | null = null;
  pedidoItems: PedidoItem[] = [];
  loading = false;
  error = false;
  items: MenuItem[];
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private _PedidoService: PedidoService,
    private messageService: MessageService
  ) {
    this.items = [
      {
        label: 'Update',
        icon: 'pi pi-refresh',
        command: () => {
          this.update();
        },
      },
      {
        label: 'Delete',
        icon: 'pi pi-times',
        command: () => {
          this.delete();
        },
      },
      { label: 'Angular.io', icon: 'pi pi-info', url: 'http://angular.io' },
      { separator: true },
      { label: 'Setup', icon: 'pi pi-cog', routerLink: ['/setup'] },
    ];
  }

  save(severity: string) {
    this.messageService.add({
      severity: severity,
      summary: 'Success',
      detail: 'Data Saved',
    });
  }

  update() {
    this.messageService.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Data Updated',
    });
  }

  delete() {
    this.messageService.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Data Deleted',
    });
  }
  async ngOnInit(): Promise<void> {
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

    await this.loadPedido(id);
    this.pedidoItems = this.pedido?.pedido_items ?? []; // o .productos si ese es el campo correcto
    console.log(this.pedidoItems);
  }
  async loadPedido(id: number) {
    this.loading = true;
    this.error = false;
    try {
      const { data, error } = await this._PedidoService.getPedidoById(id);
      console.log(data);
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
