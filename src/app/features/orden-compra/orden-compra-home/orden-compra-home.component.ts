import { Component, effect, inject, Input, OnInit, Type } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { SidebarModule } from 'primeng/sidebar';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { CardDashboardIconComponent } from 'src/app/shared/cards/card-dashboard-icon/card-dashboard-icon.component';
import { SidebarComponent } from 'src/app/shared/sidebar/sidebar/sidebar.component';
import { AccordionModule } from 'primeng/accordion';
import { TableGenericNGComponent } from 'src/app/shared/tables/table-generic-ng/table-generic-ng.component';
import { TableGenericFilterComponent } from 'src/app/shared/tables/table-generic-filter/table-generic-filter.component';
import { OrdenCompraService } from '../services/orden-compra.service';
import { OrdenCompra, Proveedor } from 'src/app/core/models/database.type';
import { CarouselCardsComponent } from "src/app/shared/cards/carousel-cards/carousel-cards.component";
import { PedidoService } from '../../pedidos/services/pedido.service';
import { TableGenericNgBigDataComponent } from "src/app/shared/tables/table-generic-ng-big-data/table-generic-ng-big-data.component";
import { ButtonModule } from 'primeng/button';
import { OrdenCompraDetailComponent } from '../orden-compra-detail/orden-compra-detail.component';
import { getBadgeClassByOC } from 'src/app/shared/funtions/pedidosFuntions';

@Component({
  selector: 'app-orden-compra-home',
  standalone: true,
  imports: [CommonModule, SidebarComponent, ToastModule, CardDashboardIconComponent, AccordionModule, CarouselCardsComponent, TableGenericNgBigDataComponent, ButtonModule],
  templateUrl: './orden-compra-home.component.html',
  styleUrls: ['./orden-compra-home.component.css'],
  providers: [MessageService, CurrencyPipe]
})
export class OrdenCompraHomeComponent implements OnInit{
  sidebarVisible = false;
  sidebarTitle = '';
  componentToLoad: Type<any> | null = null;
  sidebarInputs: Record <string, unknown> | undefined; 
  @Input() onSaveSuccess?: () => void;
  private _ordenesCompraService=inject(OrdenCompraService);
  private _pedidoService= inject(PedidoService)
  public ordenCompra= this._ordenesCompraService.ordenCompra
  public ordenesCompra=  this._ordenesCompraService.ordenesCompra;
  public pedidosUrgentes= this._pedidoService.pedidosUrgentes;
  private _messageService= inject(MessageService)
  private currencyPipe=inject(CurrencyPipe)
    async ngOnInit(): Promise<void> {
      if(this.ordenesCompra().length===0){
        this._ordenesCompraService.getAllOC()
      }
      
        this._pedidoService.getAllPedidosUrgentes()
      
  }
  constructor(){
  effect(() => {
      const ordenCompraSignal=this.ordenCompra()
    });
  }
    //Getters functions
    getNombreProveedor = (proveedor_id: Proveedor) => proveedor_id?.nombre;
    getTotalCurrency=(importe:number)=> {
      const hasDecimals = importe % 1 !== 0;
      const format = hasDecimals ? '1.2-2' : '1.0-0';
      return this.currencyPipe.transform(importe, '$', 'symbol', format);
    }
    
    // Método para obtener la clase del badge según el estado de OC
    getEstadoBadge = (estado: string, row?: any) => {
      const badgeClass = getBadgeClassByOC(estado);
      return `<span class="badge ${badgeClass}">${estado}</span>`;
    }
    
      // Getter para items de pedidos urgentes (para el carousel)
  get pedidosUrgentesItems() {
    return this.pedidosUrgentes().flatMap(p => p.pedido_items || []);
  }

  onRowExpansion(row: OrdenCompra) {
    this._ordenesCompraService.getOCById(row.id).then((result) => {
      if (result.data) {
        this.ordenesCompra.update((current) =>
          current.map((oc) => (oc.id == row.id ? result.data! : oc))
        );
      }
    });
  }
  
  async openOrdenCompra(OrdenCompraItem: OrdenCompra) {
    const result = await this._ordenesCompraService.getOCById(OrdenCompraItem.id);
    
    if (result.error) {
      console.error('Error al cargar orden de compra:', result.error);
      this._messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudo cargar la orden de compra',
      });
      return;
    }
    
    console.log('Orden cargada:', this.ordenCompra());
    this.openOrdenCompraSidebar();
  }
   openOrdenCompraSidebar(): void {
    console.log('abriendo');
    this.sidebarTitle = 'Detalle de la Orden de Compra';
    this.componentToLoad = OrdenCompraDetailComponent;
    this.sidebarInputs = {
      formResult: (result: {
        severity?: string;
        success: boolean;
        message: string;
      }) => this.handleFormResult(result),
    };

    this.sidebarVisible = true;
  }
  handleFormResult(result: {
    severity?: string;
    success?: boolean;
    message: string;
  }): void {
    if (!result.severity) {
      this._messageService.add({
        severity: result.success ? 'success' : 'error',
        summary: result.success ? 'Éxito' : 'Error',
        detail: result.message,
      });
    } else {
      this._messageService.add({
        severity: result.severity,
        summary: 'Info',
        detail: result.message,
      });
    }
  }
}
