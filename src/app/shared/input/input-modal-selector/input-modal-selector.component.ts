import {
  Component,
  ElementRef,
  forwardRef,
  Input,
  OnInit,
  ViewChild,
  NgZone,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ControlValueAccessor,
  FormsModule,
  NG_VALUE_ACCESSOR,
} from '@angular/forms';
export interface SelectorData {
  id: any;
  name: string;
  [key: string]: any;
}

declare var bootstrap: any; // Declaración para usar el objeto global de Bootstrap

@Component({
  selector: 'app-input-modal-selector',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './input-modal-selector.component.html',
  styleUrls: ['./input-modal-selector.component.css'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputModalSelectorComponent),
      multi: true,
    },
  ],
})
export class InputModalSelectorComponent
  implements ControlValueAccessor, OnInit
{
  constructor(private zone: NgZone) {}
  // --- Entradas del Componente ---
  @Input() label: string = '';
  @Input() placeholder: string = 'Elija una opción...';
  @Input() id: string = `modal-selector-${Math.random()
    .toString(36)
    .substring(2, 9)}`;
  @Input() modalTitle: string = 'Seleccionar una opción';

  // Recibe el array de datos desde el componente padre
  private _data: SelectorData[] = [];
  @Input()
  set data(value: SelectorData[]) {
    this._data = value || [];
    this.filteredData = [...this._data];
    this.updateDisplayedValue(this.selectedValueId);
  }
  get data(): SelectorData[] {
    return this._data;
  }

  // Referencia al elemento del modal en el HTML
  @ViewChild('selectorModal') modalElement!: ElementRef;
  private modalInstance: any;

  // --- Estado Interno ---
  selectedValueId: any = null;
  displayedValueName: string = '';
  isDisabled: boolean = false;
  searchTerm: string = '';
  filteredData: SelectorData[] = [];

  // --- Callbacks de ControlValueAccessor ---
  private onChange: (value: any) => void = () => {};
  onTouched: () => void = () => {};

  ngOnInit(): void {
    this.filteredData = [...this.data];
  }

  ngAfterViewInit(): void {
    // Inicializamos la instancia del modal de Bootstrap una vez que la vista está lista
    if (this.modalElement) {
      this.modalInstance = new bootstrap.Modal(this.modalElement.nativeElement);
    }
  }

  // --- Implementación de ControlValueAccessor ---

  // Angular llama a este método para establecer el valor inicial desde el formControl
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

  // Se llama cuando el usuario selecciona un item en el modal
  // En input-modal-selector.component.ts

  onItemSelect(item: SelectorData): void {
    if (this.isDisabled) return;

    // Los console.log pueden quedar o los puedes quitar
    console.log('Paso 1: onItemSelect se ha disparado. Item:', item);

    if (!item || item.id === undefined || item.id === null) {
      console.error('Error: El item seleccionado no tiene un ID válido.');
      return;
    }

    // --- CAMBIO CLAVE ---
    // Ejecutamos la lógica de actualización dentro de la zona de Angular
    this.zone.run(() => {
      // Actualizamos el estado interno del componente
      this.selectedValueId = item.id;
      this.displayedValueName = item.name;

      console.log(
        `Paso 2: Notificando al formulario con el valor -> ${this.selectedValueId} (dentro de NgZone)`
      );

      // Notificamos a Angular Forms sobre el cambio de valor (enviando el ID)
      this.onChange(this.selectedValueId);
      this.onTouched();
    });
  }

  // Filtra los datos en el modal según el término de búsqueda
  filterItems(): void {
    if (!this.searchTerm) {
      this.filteredData = [...this.data];
    } else {
      const lowerCaseSearch = this.searchTerm.toLowerCase();
      this.filteredData = this.data.filter(
        (item) =>
          item.name.toLowerCase().includes(lowerCaseSearch) ||
          String(item.id).toLowerCase().includes(lowerCaseSearch)
      );
    }
  }

  // Abre el modal
  openModal(): void {
    if (this.isDisabled) return;
    this.searchTerm = '';
    this.filterItems();
    this.modalInstance.show();
  }

  // Busca el nombre correspondiente a un ID para mostrarlo
  private updateDisplayedValue(id: any): void {
    if (id !== null && id !== undefined) {
      const selectedItem = this.data.find((item) => item.id === id);
      this.displayedValueName = selectedItem ? selectedItem.name : '';
    } else {
      this.displayedValueName = '';
    }
  }
}
