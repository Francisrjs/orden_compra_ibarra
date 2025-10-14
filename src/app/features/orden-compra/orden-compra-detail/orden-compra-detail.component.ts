import { Component, Input, Type } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrdenCompra } from 'src/app/core/models/database.type';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { TableGenericNGComponent } from 'src/app/shared/tables/table-generic-ng/table-generic-ng.component';
import { getBadgeClassByOC } from 'src/app/shared/funtions/pedidosFuntions';
import { ButtonElegantComponent } from 'src/app/shared/buttons/button-elegant/button-elegant.component';
@Component({
  selector: 'app-orden-compra-detail',
  standalone: true,
  imports: [CommonModule,CardModule,TableGenericNGComponent,DividerModule,ButtonElegantComponent],
  templateUrl: './orden-compra-detail.component.html',
  styleUrls: ['./orden-compra-detail.component.css']
})
export class OrdenCompraDetailComponent {
sidebarVisible = false;
sidebarTitle = '';
componentToLoad: Type<any> | null = null;
sidebarInputs: Record<string, unknown> | undefined; // Para los inputs del componente dinámico
@Input() dataOrden:OrdenCompra | null=null;

getTotalCurrency(value: number): string {
  return value ? '$' + value.toFixed(2) : '$0.00';
}

getImporteCurrency(value: number): string {
  return value ? '$' + value.toFixed(2) : '$0.00';
}
  getBadgeClass(estado: string) {
    return getBadgeClassByOC(estado);
  }
}
