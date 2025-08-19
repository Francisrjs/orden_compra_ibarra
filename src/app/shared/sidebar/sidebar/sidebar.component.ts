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
  @Input() isVisible: boolean = false;
  @Output() isVisibleChange = new EventEmitter<boolean>();
  @Input() title: string = '';
  // ELIMINA: @Input() componentToLoad: Type<any> | null = null;

  hideSidebar(): void {
    this.isVisible = false;
    this.isVisibleChange.emit(this.isVisible);
  }
}
