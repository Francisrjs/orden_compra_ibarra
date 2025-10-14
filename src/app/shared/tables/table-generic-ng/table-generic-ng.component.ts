import { Component, Input, ContentChild, TemplateRef, Signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { RippleModule } from 'primeng/ripple';

@Component({
  selector: 'app-table-generic-ng',
  standalone: true,
  imports: [CommonModule, TableModule, ButtonModule, TagModule, RippleModule],
  templateUrl: './table-generic-ng.component.html',
  styleUrls: ['./table-generic-ng.component.css']
})
export class TableGenericNGComponent<T = any> {
  @Input() columns: Array<{ field: string; header: string; width?: string; pipe?: (value: any, row?: T) => any }> = [];
  @Input() data: T[] | Signal<T[]> = [];
  @Input() minWidth: string = '40rem';
  @ContentChild('actions', { static: false }) actionsTemplate?: TemplateRef<any>;

  @Input() expansionField: string = 'orden_compra_items';
  @Input() rowExpansionColumns: Array<{ field: string; header: string; pipe?: (value: any, row?: any) => any }> = [];
  
  // Footer totals
  @Input() showFooter: boolean = false;
  @Input() footerColumns: string[] = [];
  @Input() footerLabel: string = 'Total';

  dataSignal = computed(() => {
    if (typeof this.data === 'function') {
      return (this.data as Signal<T[]>)() ?? [];
    }
    return this.data ?? [];
  });

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
  
  // Método para calcular el total de una columna
  calculateTotal(field: string): number {
    return this.dataSignal().reduce((sum, row) => {
      const value = this.getFieldValue(row, field);
      return sum + (typeof value === 'number' ? value : 0);
    }, 0);
  }

  // Método para verificar si una columna debe mostrar total
  shouldShowTotal(field: string): boolean {
    return this.footerColumns.includes(field);
  }
  
  onToggle(row: any, dt: any) {
    // Depuración al expandir/cerrar fila
    console.log('Row expansion toggled:', row);
    const expansionData = this.getFieldValue(row, this.expansionField);
    console.log('Expansion field:', this.expansionField);
    console.log('Expansion data:', expansionData);
    // No llamar a dt.toggleRow(row) aquí, PrimeNG lo maneja automáticamente
    // console.log('isExpanded?', dt.isRowExpanded(row));
  }
}