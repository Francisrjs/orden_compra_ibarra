import { CommonModule } from '@angular/common';
import { Component, effect, OnInit, Type } from '@angular/core';
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
import { ProductoFormComponent } from '../../productos/producto/producto-form/producto-form.component';
import { SidebarService } from 'src/app/shared/sidebar/sidebar/services/sidebar.service';
import { SidebarComponent } from 'src/app/shared/sidebar/sidebar/sidebar.component';
import { ProductoPedidoFormComponent } from '../../productos/producto/producto-pedido-form/producto-pedido-form.component';

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
    SidebarComponent,
    ProductoFormComponent,
  ],
  providers: [MessageService],
})
export class PedidosDetalleComponent implements OnInit {
  // im
  pedido = this._PedidoService.pedido;
  pedidoItems: PedidoItem[] = [];
  loading = false;
  error = false;

  sidebarVisible = false;
  sidebarTitle = '';
  componentToLoad: Type<any> | null = null; // Correcto

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private _PedidoService: PedidoService,
    private messageService: MessageService,
    private _sidebarService: SidebarService
  ) {
    effect(() => {
      const currentPedido = this.pedido();
      this.pedidoItems = currentPedido?.pedido_items ?? [];

      // Debug: ver qué datos llegan
      console.log('Pedido actual:', currentPedido);
      console.log('Items del pedido:', this.pedidoItems);
    });
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
  }
  async loadPedido(id: number) {
    this.loading = true;
    this.error = false;
    try {
      const { data, error } = await this._PedidoService.getPedidoById(id);

      // 1. Si la API devuelve un error o no hay datos, lanzamos una excepción.
      if (error) {
        throw new Error(
          error.message || 'Error al cargar el pedido desde la API.'
        );
      }
      if (!data) {
        throw new Error(`No se encontró un pedido con el id ${id}.`);
      }

      // 2. Si todo va bien (el "happy path"), actualizamos la señal.
      this.pedido.set(data);
    } catch (err: any) {
      // 3. ÚNICO lugar para manejar CUALQUIER tipo de error.
      console.error(err.message); // Logueamos el mensaje de error específico.
      this.error = true;
      this.pedido.set(null);
    } finally {
      // 4. Esto se ejecuta siempre, asegurando que el loading se desactive.
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
  openProductForm(): void {
    console.log('abriendo');
    this.sidebarTitle = 'Agregar Nuevo Producto';
    // 2. Asegúrate de que el nombre de la clase aquí es exactamente el mismo que importaste
    this.componentToLoad = ProductoPedidoFormComponent;
    this.sidebarVisible = true;
  }
  deleteItemPedido(idProductoPedido: number) {
    this._PedidoService.deleteProductoPedido(idProductoPedido);
  }
}
