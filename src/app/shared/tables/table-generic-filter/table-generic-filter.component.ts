import { Component, computed, ContentChild, Input, Signal, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableGenericComponent } from '../table-generic/table-generic.component';
import { TableGenericNGComponent } from '../table-generic-ng/table-generic-ng.component';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-table-generic-filter',
  standalone: true,
  imports: [CommonModule,TableGenericNGComponent,ButtonModule],
  templateUrl: './table-generic-filter.component.html',
  styleUrls: ['./table-generic-filter.component.css']
})
export class TableGenericFilterComponent <T = any> {
  @Input() data: T[] | Signal<T[]> = [];
  @Input() filter: T[]=[];
  @Input() columns: any[] = [];
  @Input() minWidth: string = '40rem';
@Input() addButtonClick?: (item: any) => void;
@Input() trashButtonClick?: (item: any) => void;
  @Input() trashButton: boolean=false;
  @Input() addButton: boolean=false;
  @ContentChild('actions', { static: false }) actionsTemplate?: TemplateRef<any>;
   dataFilter = computed(() => {
    const dataArr: T[] = typeof this.data === 'function' ? (this.data as Signal<T[]>)() ?? [] : this.data ?? [];
    if (!this.filter || this.filter.length === 0) return dataArr;
    // Filtra por id (puedes cambiar la lógica según tu necesidad)
    const filterIds = this.filter.map(item => (item as any).id);
    return dataArr.filter(item => filterIds.includes((item as any).id));
  });
  trashClick(item:any){
    if(this.trashButtonClick){
      this.trashButtonClick(item)
    }
  }
  addClick(item:any){
    if(this.addButtonClick) this.addButtonClick(item)
  }
}
