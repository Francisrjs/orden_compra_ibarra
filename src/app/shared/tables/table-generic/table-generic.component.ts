import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  Output,
  TemplateRef,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { RippleModule } from 'primeng/ripple';
import { TagModule } from 'primeng/tag';
import { Table } from 'primeng/table';
import { ButtonWithIconComponent } from '../../buttons/button-with-icon/button-with-icon.component';
import { HttpClientModule } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { InputBoxComponent } from '../../input/input-box/input-box.component';

/**
 * Configuración de cada columna que se mostrará en la tabla
 */
export interface GenericTableColumn<T = any> {
  /** Propiedad del objeto a mostrar, puede ser deep path (e.g. 'producto.nombre') */
  field: string;
  /** Encabezado visible */
  header: string;
  /** Tipo de dato para filtros/sort: 'text' | 'date' | 'number' | 'custom' */
  type?: 'text' | 'date' | 'number' | 'custom';
  /** Mostrar ordenamiento */
  sortable?: boolean;
  /** Mostrar filtro */
  filter?: boolean;
  /** Plantilla custom por si el consumidor quiere personalizar la celda */
  bodyTemplate?: TemplateRef<any> | null; // optional custom cell
  /** Ancho opcional */
  width?: string;
  /** Clase CSS opcional */
  styleClass?: string;
}

export interface GenericTableAction<T = any> {
  icon?: string; // icono PrimeNG (pi pi-*) o Bootstrap
  label?: string; // texto del botón (opcional si solo icono)
  severity?: string; // success | info | warning | danger etc.
  styleClass?: string; // clases extra
  rounded?: boolean; // estilo redondeado
  text?: boolean; // estilo texto
  /** Devuelve el item sobre el que se hace click */
  onClick: (row: T) => void;
  /** Mostrar condicionalmente */
  visible?: (row: T) => boolean;
}

@Component({
  selector: 'app-table-generic',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    TagModule,
    RippleModule,
    ButtonWithIconComponent,
    RouterLink,
    ToastModule,
    ConfirmDialogModule,
    InputBoxComponent,
  ],
  templateUrl: './table-generic.component.html',
  styleUrls: ['./table-generic.component.css'],
})
export class TableGenericComponent<T = any> {
  /** Lista de datos ya cargada (alternativa a serviceFn) */
  private _data: T[] | null = null;
  @Input()
  set data(value: T[] | null) {
    this._data = value;
    if (value) {
      this.items = value;
    } else {
      this.items = [];
    }
  }
  get data(): T[] | null {
    return this._data;
  }
  /** Si se pasa una función async se llamará en ngOnInit y al ejecutar reload(). Puede devolver null y se normaliza a [] */
  @Input() serviceFn?: () => Promise<T[] | null | undefined>;
  /** Columnas configurables */
  @Input() columns: GenericTableColumn<T>[] = [];
  /** Acciones por fila (botonera a la derecha) */
  @Input() rowActions: GenericTableAction<T>[] = [];
  /** Mostrar botón de añadir */
  @Input() showAddButton = false;
  /** Texto botón añadir */
  @Input() addButtonLabel = 'Añadir';
  /** Placeholder buscador */
  @Input() searchPlaceholder = 'Buscar';
  /** Campos global filter (si no se especifica se toma columns.field text) */
  @Input() globalFilterFields: string[] = [];
  /** Mostrar expand rows */
  @Input() expandableRows = false;
  /** Template para contenido expandido */
  @Input() rowExpansionTemplate: TemplateRef<any> | null = null;
  /** Clave primaria de los objetos (por defecto 'id') */
  @Input() dataKey: string = 'id';
  /** Emite al click del botón agregar */
  @Output() add = new EventEmitter<void>();
  /** Emite al seleccionar (row click) */
  @Output() rowSelect = new EventEmitter<T>();
  /** Emite cambios de búsqueda global */
  @Output() searchChange = new EventEmitter<string>();

  loading = false;
  items: T[] = [];
  searchValue = '';

  async ngOnInit() {
    await this.loadData();
  }

  async loadData() {
    if (this.serviceFn) {
      try {
        this.loading = true;
        const result = await this.serviceFn();
        this.items = (result ?? []) as T[];
      } finally {
        this.loading = false;
      }
    } else if (this.data) {
      this.items = this.data;
    } else {
      this.items = [];
    }
    if (!this.globalFilterFields || this.globalFilterFields.length === 0) {
      this.globalFilterFields = this.columns
        .filter((c) => (c.type ?? 'text') !== 'custom')
        .map((c) => c.field);
    }
  }

  reload() {
    this.loadData();
  }

  clear(table: Table) {
    table.clear();
  }

  applyGlobalFilter(event: Event, table: Table) {
    const value = (event.target as HTMLInputElement).value;
    this.searchValue = value;
    table.filterGlobal(value, 'contains');
    this.searchChange.emit(value);
  }

  onAddClick() {
    this.add.emit();
  }

  onRowClick(row: T) {
    this.rowSelect.emit(row);
  }

  /** Acceso a propiedades deep path (a.b.c) */
  resolveFieldData(data: any, field: string): any {
    if (!data || !field) return null;
    if (field.indexOf('.') === -1) {
      return data[field];
    }
    return field
      .split('.')
      .reduce((acc: any, cur) => (acc ? acc[cur] : undefined), data);
  }

  getActionNgClass(action: GenericTableAction<T>): any[] {
    return [
      action.styleClass,
      action.severity ? `p-button-${action.severity}` : '',
      action.text ? 'p-button-text' : '',
      action.rounded ? 'p-button-rounded' : '',
    ];
  }
}
