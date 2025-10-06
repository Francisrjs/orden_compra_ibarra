import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CarouselModule } from 'primeng/carousel';
import { OrdenCompraItem, Pedido, PedidoItem } from 'src/app/core/models/database.type';
import { TagModule } from 'primeng/tag';
import { getEstadoTiempo } from '../../funtions/pedidosFuntions';
import { ButtonModule } from 'primeng/button';
import { RouterLink } from '@angular/router';
@Component({
  selector: 'app-carousel-cards',
  standalone: true,
  imports: [CommonModule,CarouselModule,TagModule,ButtonModule,RouterLink],
  templateUrl: './carousel-cards.component.html',
  styleUrls: ['./carousel-cards.component.css']
})
export class CarouselCardsComponent implements OnInit{
  @Input() items: PedidoItem[] | OrdenCompraItem[] = [];
  @Input() pedidos:Pedido[]=[]
  @Input() title:string =''
   responsiveOptions: any[] | undefined;
  

  ngOnInit(): void {
         this.responsiveOptions = [
            {
                breakpoint: '1199px',
                numVisible: 1,
                numScroll: 1
            },
            {
                breakpoint: '991px',
                numVisible: 2,
                numScroll: 1
            },
            {
                breakpoint: '767px',
                numVisible: 1,
                numScroll: 1
            }
        ];
  }
     getProducto(item: PedidoItem | OrdenCompraItem) {
    if ('pedido_items' in item && item.pedido_items) {
      return item.pedido_items.producto;
    }
    return (item as PedidoItem).producto;
  }
    getCategoriaIcon(item: PedidoItem | OrdenCompraItem) {
    return this.getProducto(item)?.categoria?.icon_text ?? '';
  }
    getNumeroPedido(idItem:PedidoItem){
    return this.pedidos.find(p=>p.pedido_items?.some(i=>i.id===idItem.id))?.numero_pedido;
  }
    getEstadoTiempo(idItem:PedidoItem){
    return this.pedidos.find(p=>p.pedido_items?.some(i=>i.id===idItem.id))?.tiempo_item;
  }
    getPedido(item:PedidoItem | OrdenCompraItem){
      let pedido;
    if ('pedido_items' in item && item.pedido_items) {
        // OrdenCompraItem: find the pedido that contains this item
         pedido = this.pedidos.find(p => p.pedido_items?.some(i => item.pedido_items && i.id === item.pedido_items.id));
  
      } else {
        // PedidoItem: find the pedido that contains this item
         pedido = this.pedidos.find(p => p.pedido_items?.some(i => i.id === item.id));
      }
      return pedido;
    }
    getSeverity(item: PedidoItem | OrdenCompraItem) {
      // Find the corresponding pedido and get its tiempo_item, then pass it to getEstadoTiempo
      let tiempo_item: any;
      if ('pedido_items' in item && item.pedido_items) {
        // OrdenCompraItem: find the pedido that contains this item
        const pedido = this.pedidos.find(p => p.pedido_items?.some(i => item.pedido_items && i.id === item.pedido_items.id));
        tiempo_item = pedido?.tiempo_item;
      } else {
        // PedidoItem: find the pedido that contains this item
        const pedido = this.pedidos.find(p => p.pedido_items?.some(i => i.id === item.id));
        tiempo_item = pedido?.tiempo_item;
      }
      return getEstadoTiempo(tiempo_item);
    }

}
