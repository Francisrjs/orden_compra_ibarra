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

  dataSignal = computed(() => {
    if (typeof this.data === 'function') {
      return (this.data as Signal<T[]>)() ?? [];
    }
    return this.data ?? [];
  });
}