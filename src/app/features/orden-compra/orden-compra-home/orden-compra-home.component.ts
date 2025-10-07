import { Component, inject, Input, OnInit, Type } from '@angular/core';
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

@Component({
  selector: 'app-orden-compra-home',
  standalone: true,
  imports: [CommonModule, SidebarComponent, ToastModule, CardDashboardIconComponent, AccordionModule, TableGenericNGComponent, TableGenericFilterComponent, CarouselCardsComponent, TableGenericNgBigDataComponent, ButtonModule],
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
  public ordenesCompra=  this._ordenesCompraService.ordenesCompra;
  public pedidosUrgentes= this._pedidoService.pedidosUrgentes;
  private currencyPipe=inject(CurrencyPipe)
    async ngOnInit(): Promise<void> {
      if(this.ordenesCompra().length===0){
        this._ordenesCompraService.getAllOC()
      }
      
        this._pedidoService.getAllPedidosUrgentes()
      
  }
  
    //Getters functions
    getNombreProveedor = (proveedor_id: Proveedor) => proveedor_id?.nombre;
    getTotalCurrency=(importe:number)=> {
      const hasDecimals = importe % 1 !== 0;
      const format = hasDecimals ? '1.2-2' : '1.0-0';
      return this.currencyPipe.transform(importe, '$', 'symbol', format);
    }
      // Getter para items de pedidos urgentes (para el carousel)
  get pedidosUrgentesItems() {
    return this.pedidosUrgentes().flatMap(p => p.pedido_items || []);
  }

  onRowExpansion (row:OrdenCompra){
    this._ordenesCompraService.getOCById(row.id).then(result=>{
      if(result.data){
        this.ordenesCompra.update(current=>
          current.map(oc => oc.id == row.id ? result.data! : oc)
        )
      }
      
    })
  }
}
