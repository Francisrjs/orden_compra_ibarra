import { Component, computed, ContentChild, Input, Output, Signal, TemplateRef,EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ButtonWithIconComponent } from '../../buttons/button-with-icon/button-with-icon.component';


@Component({
  selector: 'app-table-generic-ng-big-data',
  standalone: true,
  imports: [CommonModule,TableModule,ButtonModule,ButtonWithIconComponent],
  templateUrl: './table-generic-ng-big-data.component.html',
  styleUrls: ['./table-generic-ng-big-data.component.css']
})
export class TableGenericNgBigDataComponent  <T = any> implements OnInit{
  filterInputVisible: { [field: string]: boolean } = {};

  toggleFilterInput(field: string) {
    this.filterInputVisible[field] = !this.filterInputVisible[field];
  }
  @Input() columns: Array<{ field: string; header: string; width?: string; pipe?: (value: any, row?: T) => any; filterable?: boolean; isHtml?: boolean }> = [];
  @Input() data: T[] | Signal<T[]> = [];
  @Input() minWidth: string = '40rem';
  @ContentChild('actions', { static: false }) actionsTemplate?: TemplateRef<any>;

  @Input() expansionField: string = 'orden_compra_items';
  @Output() rowExpansionInfo = new EventEmitter<any>();
  @Input() rowExpansionColumns: Array<{ field: string; header: string; pipe?: (value: any, row?: any) => any }> = [];
  filterValues: { [field: string]: string } = {};


  dataSignal = computed(() => {
    if (typeof this.data === 'function') {
      return (this.data as Signal<T[]>)() ?? [];
    }
    return this.data ?? [];
  });
  ngOnInit() {
  this.filteredData = this.dataSignal();
}
getInputValue(event: Event): string {
  return (event.target && (event.target as HTMLInputElement).value) || '';
}
  // Helper para resolver campos con dot notation (p.ej. 'pedido_item_id.id')
  getFieldValue(obj: any, field?: string) {
    if (!field) return obj;
    const parts = field.split('.');
    let value = obj;
    for (const p of parts) {
      if (value == null) return null;
      value = value[p];
    }
    return value;
  }

  // Wrapper que aplica pipe si existe
  applyPipe(pipe: ((v: any, row?: any) => any) | undefined, value: any, row?: any) {
    return pipe ? pipe(value, row) : value;
  }
  onToggle(row: any, dt: any) {
    // Depuración al expandir/cerrar fila
    this.rowExpansionInfo.emit(row)
    const expansionData = this.getFieldValue(row, this.expansionField);
    console.log('Expansion field:', this.expansionField);
    console.log('Expansion data:', expansionData);
    // No llamar a dt.toggleRow(row) aquí, PrimeNG lo maneja automáticamente
    // console.log('isExpanded?', dt.isRowExpanded(row));
  }

  
onFilter(value: string, field: string) {
  this.filterValues[field] = value.toLowerCase();
  this.applyFilters();
}

applyFilters() {
  let filtered = this.dataSignal();
  Object.entries(this.filterValues).forEach(([field, value]) => {
    if (value) {
      filtered = filtered.filter(row => {
        const cell = this.getFieldValue(row, field);
        return cell && cell.toString().toLowerCase().includes(value);
      });
    }
  });
  this.filteredData = filtered;
}

// Data para mostrar en la tabla
filteredData: T[] = [];
}
