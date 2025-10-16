import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { InputNumber, InputNumberModule } from 'primeng/inputnumber';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { FormsModule } from '@angular/forms';
import { InputDateComponent } from '../../input/input-date/input-date.component';

@Component({
  selector: 'app-pop-up-ng',
  standalone: true,
  imports: [CommonModule, DialogModule, InputNumberModule, ButtonModule, DropdownModule, FormsModule, InputDateComponent],
  templateUrl: './pop-up-ng.component.html',
  styleUrls: ['./pop-up-ng.component.css']
})
export class PopUpNgComponent {
  @Input() titleModal: string = 'titulo';
  @Input() description: string = 'descripcion';
  @Input() show: boolean = false;
  @Input() iconClass: string = 'pi pi-question-circle';
  @Input() iconColor: string = 'text-blue-500';
  @Input() headerIcon: string = 'pi pi-exclamation-triangle';
  @Input() includeInput: boolean = false;
  @Input() inputType: 'number' | 'date' | 'dropdown' | 'none' = 'none';
  @Input() type: 'default' | 'danger' | 'warning' = 'default';
  @Input() prefix: '$' | '' ='';
  // Inputs para dropdown
  @Input() dropdownOptions: any[] = [];
  @Input() dropdownPlaceholder: string = 'Seleccione una opción';
  @Input() dropdownOptionLabel: string = 'label';
  @Input() dropdownOptionValue: string = 'value';
  
  // Inputs para date
  @Input() minDate?: string;
  @Input() maxDate?: string;
  
  // Inputs para number
  @Input() numberMin: number = 0;
  @Input() numberMax?: number;
  @Input() numberPlaceholder: string = 'Ingrese un número';
  
  // Valores de los inputs
  inputNumberValue?: number;
  inputDateValue?: string;
  inputDropdownValue?: any;

  get popupIcon(): string {
  switch(this.type) {
    case 'danger':
      return 'pi pi-times-circle';
    case 'warning':
      return 'pi pi-exclamation-triangle';
    default:
      return 'pi pi-question-circle';
  }
}

  get popupIconColor(): string {
    switch (this.type) {
      case 'danger':
        return 'text-red';
      case 'warning':
        return 'text-yellow';
      default:
        return 'text-blue';
    }
  }

  @Output() onAccept = new EventEmitter<any>();
  @Output() onCancel = new EventEmitter<any>();
  @Output() inputValue = new EventEmitter<any>();
  @ViewChild('popupContainer') popupContainer!: ElementRef<HTMLDivElement>;

  ngAfterViewInit() {
    if (this.show && this.popupContainer) {
      this.popupContainer.nativeElement.focus();
    }
  }

  onEnterPrecio() {
    this.accept();
  }

  onEscCancel() {
    this.onCancel.emit();
  }

  accept() {
    // Emitir el valor según el tipo de input
    let value;
    switch (this.inputType) {
      case 'number':
        value = this.inputNumberValue;
        break;
      case 'date':
        value = this.inputDateValue;
        break;
      case 'dropdown':
        value = this.inputDropdownValue;
        break;
      default:
        value = null;
    }
    
    this.inputValue.emit(value);
    this.onAccept.emit(value);
  }

  cancel() {
    this.onCancel.emit();
  }
}
