import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges } from '@angular/core';

@Component({
  selector: 'app-card-dashboard-icon',
  templateUrl: './card-dashboard-icon.component.html',
  styleUrls: ['./card-dashboard-icon.component.css'],
  standalone: true,
  imports: [CommonModule],
})
export class CardDashboardIconComponent implements OnChanges {
  @Input() title: string = 'titulo';
  @Input() value: string = 'valor';
  @Input() icon: string = 'bi-calendar';
  @Input() borderColor: string = 'primary';
  @Input() hasCustomIconColor: boolean = true;

  iconColor: string = '';

  ngOnChanges(): void {
    if (this.hasCustomIconColor) {
      switch (this.borderColor) {
        case 'primary':
          this.iconColor = '#4e73df'; // azul bootstrap
          break;
        case 'success':
          this.iconColor = '#1cc88a'; // verde bootstrap
          break;
        case 'warning':
          this.iconColor = '#f6c23e'; // amarillo bootstrap
          break;
        case 'danger':
          this.iconColor = '#e74a3b'; // rojo bootstrap
          break;
        case 'secondary':
          this.iconColor = '#858796'; // gris bootstrap
          break;
        default:
          this.iconColor = '#dddfeb'; // gris claro por defecto
          break;
      }
    }
  }
}
