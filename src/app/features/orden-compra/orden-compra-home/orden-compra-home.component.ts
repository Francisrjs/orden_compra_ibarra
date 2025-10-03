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
import { Proveedor } from 'src/app/core/models/database.type';

@Component({
  selector: 'app-orden-compra-home',
  standalone: true,
  imports: [CommonModule,SidebarComponent, ToastModule, CardDashboardIconComponent, AccordionModule, TableGenericNGComponent,TableGenericFilterComponent ],
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
  private _ordenesCompraService=inject(OrdenCompraService)
  public ordenesCompra=  this._ordenesCompraService.ordenesCompra
  private currencyPipe=inject(CurrencyPipe)
    async ngOnInit(): Promise<void> {
      if(this.ordenesCompra().length===0){
        this._ordenesCompraService.getAllOC()
      }
  }
  
    //Getters functions
    getNombreProveedor = (proveedor_id: Proveedor) => proveedor_id?.nombre;
    getTotalCurrency=(importe:number)=> {
      const hasDecimals = importe % 1 !== 0;
      const format = hasDecimals ? '1.2-2' : '1.0-0';
      return this.currencyPipe.transform(importe, '$', 'symbol', format);
    }
}
