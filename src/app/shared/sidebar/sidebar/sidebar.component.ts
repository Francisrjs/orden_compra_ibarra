import { CommonModule } from '@angular/common';
import {
  Component,
  Input,
  Output,
  EventEmitter,
  Type,
  Injector,
  ViewChild,
  ViewContainerRef,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { SidebarModule } from 'primeng/sidebar';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'],
  imports: [SidebarModule, CommonModule],
  standalone: true,
})
export class SidebarComponent {
  /**
   * Controla la visibilidad del sidebar.
   * Se usa con "banana in a box" [(isVisible)] para two-way binding.
   */
  @Input() isVisible: boolean = false;
  @Output() isVisibleChange = new EventEmitter<boolean>();

  /**
   * Título que se mostrará en la cabecera del sidebar.
   */
  @Input() title: string = '';

  /**
   * La clase del componente que se va a cargar dinámicamente dentro del sidebar.
   * Ejemplo: ProductoPedidoFormComponent
   */
  @Input() componentToLoad: Type<any> | null = null;

  /**
   * Un objeto que contiene todos los @Inputs que se pasarán al componente dinámico.
   * Las claves del objeto deben coincidir con los nombres de los @Input del componente hijo.
   * Ejemplo: { pedidoId: 123, onSave: (e) => this.handleSave(e) }
   */
  @Input() componentInputs: Record<string, unknown> | undefined = undefined;

  /**
   * Se dispara cuando el sidebar se oculta (ya sea por clic en la 'x' o en el overlay).
   * Emite el nuevo estado de visibilidad para que el padre lo sepa.
   */
  hideSidebar(): void {
    this.isVisible = false;
    this.isVisibleChange.emit(this.isVisible);
  }
}
