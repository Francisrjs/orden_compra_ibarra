import {
  Component,
  ElementRef,
  forwardRef,
  Input,
  OnInit,
  ViewChild,
  NgZone,
  AfterViewInit, // Importa AfterViewInit
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ControlValueAccessor,
  FormsModule,
  NG_VALUE_ACCESSOR,
} from '@angular/forms';

// --- Importaciones de PrimeNG ---
import { Table, TableModule } from 'primeng/table'; // Importa Table para usar @ViewChild
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';

export interface SelectorData {
  id: any;
  name: string;
  [key: string]: any;
}

declare var bootstrap: any;

@Component({
  selector: 'app-input-modal-selector',
  standalone: true,
  // --- Agrega los módulos de PrimeNG aquí ---
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    InputTextModule,
    ButtonModule,
  ],
  templateUrl: './input-modal-selector.component.html',
  styleUrls: ['./input-modal-selector.component.css'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputModalSelectorComponent),
      multi: true,
    },
  ],
}) // Implementa AfterViewInit
export class InputModalSelectorComponent
  implements ControlValueAccessor, OnInit, AfterViewInit
{
  constructor(private zone: NgZone) {}

  // --- Entradas del Componente ---
  @Input() label: string = '';
  @Input() placeholder: string = 'Elija una opción...';
  @Input() id: string = `modal-selector-${Math.random()
    .toString(36)
    .substring(2, 9)}`;
  @Input() modalTitle: string = 'Seleccionar un Producto';
  @Input() isDisabled: boolean = false;
  private _data: SelectorData[] = [];
  @Input()
  set data(value: SelectorData[]) {
    this._data = value || [];
    this.updateDisplayedValue(this.selectedValueId);
  }
  get data(): SelectorData[] {
    return this._data;
  }

  // Referencias a elementos del DOM
  @ViewChild('selectorModal') modalElement!: ElementRef;
  @ViewChild('dt') pTable!: Table; // Referencia a la tabla de PrimeNG

  private modalInstance: any;

  // --- Estado Interno ---
  selectedValueId: any = null;
  displayedValueName: string = '';

  // Las propiedades 'searchTerm' y 'filteredData' ya no son necesarias.
  // La tabla de PrimeNG gestionará el filtrado internamente.

  // --- Callbacks de ControlValueAccessor ---
  private onChange: (value: any) => void = () => {};
  onTouched: () => void = () => {};

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    if (this.modalElement) {
      this.modalInstance = new bootstrap.Modal(this.modalElement.nativeElement);
    }
  }

  // --- Implementación de ControlValueAccessor ---
  writeValue(id: any): void {
    this.selectedValueId = id;
    this.updateDisplayedValue(id);
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
  }

  // --- Lógica del Componente ---

  // NUEVO: Se dispara cuando se selecciona una fila en la tabla
  onRowSelect(event: any): void {
    if (this.isDisabled || !event.data) return;

    // Usamos el objeto event.data que nos proporciona la tabla
    const selectedItem: SelectorData = event.data;

    this.zone.run(() => {
      this.selectedValueId = selectedItem.id;
      this.displayedValueName = selectedItem.name;
      this.onChange(this.selectedValueId);
      this.onTouched();

      // Cierra el modal después de seleccionar
      this.modalInstance.hide();
    });
  }

  // Abre el modal y resetea el filtro de la tabla
  openModal(): void {
    if (this.isDisabled) return;
    // Reseteamos el estado del filtro de la tabla cada vez que se abre
    if (this.pTable) {
      this.pTable.clear(); // Limpia filtros y paginación
      const searchInput =
        this.modalElement.nativeElement.querySelector('input[type="text"]');
      if (searchInput) searchInput.value = '';
    }
    this.modalInstance.show();
  }

  // Busca el nombre correspondiente a un ID para mostrarlo
  private updateDisplayedValue(id: any): void {
    if (id !== null && id !== undefined) {
      // Usamos _data porque es la fuente original y completa de datos
      const selectedItem = this._data.find((item) => item.id === id);
      this.displayedValueName = selectedItem ? selectedItem.name : '';
    } else {
      this.displayedValueName = '';
    }
  }
}
