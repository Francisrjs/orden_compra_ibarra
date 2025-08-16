import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { TableBootstrapComponent } from 'src/app/shared/tables/table-bootstrap/table-bootstrap.component';
import { PedidoService } from './services/pedido.service';
import { Pedido } from 'src/app/core/models/database.type';

@Component({
  selector: 'app-pedidos',
  templateUrl: './pedidos.component.html',
  styleUrls: ['./pedidos.component.css'],
})
export class PedidosComponent implements OnInit {
  private _pedidoService = inject(PedidoService);
  loading=false;
  error: string|null =null;
  pedidos: Pedido[]=[]

  async ngOnInit(): Promise<void> {
      this.loading=true;
        try {
          const data= await this._pedidoService.getAllPedidos()
          if(data){
            this.pedidos= data 
          }else{ this.pedidos=[]}
  } catch (error) {
    console.error(error);
  } finally {
    this.loading=false;
  }
  }


  
}
