import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { InputNumber, InputNumberModule } from 'primeng/inputnumber';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-pop-up-ng',
  standalone: true,
  imports: [CommonModule, DialogModule,InputNumberModule,ButtonModule],
  templateUrl: './pop-up-ng.component.html',
  styleUrls: ['./pop-up-ng.component.css']
})
export class PopUpNgComponent {
@Input() titleModal:string='titulo';
@Input() description:string='descripcion';
@Input() show:boolean=false;
@Input() iconClass: string = 'pi pi-question-circle';
@Input() iconColor: string = 'text-blue-500';
@Input() headerIcon: string = 'pi pi-exclamation-triangle';
@Input() includeInput:boolean = false;
@Input() type: 'default' | 'danger' | 'warning' = 'default';

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
  switch(this.type) {
    case 'danger':
      return 'text-red';
    case 'warning':
      return 'text-yellow';
    default:
      return 'text-blue';
  }
}
@Output() onAccept=new EventEmitter<any>();
@Output() onCancel=new EventEmitter<any>();
@Output() inputNumber= new EventEmitter<number>();
 @ViewChild('popupContainer') popupContainer!: ElementRef<HTMLDivElement>;

  ngAfterViewInit() {
    if (this.show && this.popupContainer) {
      this.popupContainer.nativeElement.focus();
    }
  }
 onEnterPrecio() {
 this.accept()
}
onEscCancel(){
  this.onCancel.emit()
}
 accept(){
  this.onAccept.emit()
}
cancel(){
  this.onCancel.emit()
}

}
