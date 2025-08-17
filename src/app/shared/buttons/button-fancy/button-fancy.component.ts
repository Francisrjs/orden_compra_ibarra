import {
  Component,
  Input,
  Output,
  EventEmitter,
  ElementRef,
  AfterViewInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-button-fancy',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './button-fancy.component.html',
  styleUrls: ['./button-fancy.component.css'],
})
export class ButtonFancyComponent implements AfterViewInit {
  //   ejemplos:
  //   <app-button-fancy text="Añadir pedido" icon="bi bi-plus"></app-button-fancy>
  // <app-button-fancy
  //   text="Eliminar"
  //   icon="bi bi-trash"
  //   color="#c82333"
  // ></app-button-fancy>
  // <app-button-fancy
  //   text="Enviar"
  //   icon="bi bi-send"
  //   variant="primary"
  // ></app-button-fancy>

  /** 1) Texto del botón */
  @Input() text: string = 'Botón';

  /**
   * 2) Icono bootstrap: por ejemplo "bi bi-plus" o "bi bi-arrow-right-short".
   *    Lo aplicamos directamente al <i>.
   */
  @Input() icon: string = 'bi bi-plus';

  /**
   * 3) Variant: si pasás "primary", "success", "danger", etc. intentamos usar
   *    los estilos de Bootstrap para calcular colores por defecto.
   */
  @Input() variant?: string;

  /**
   * 3b) Color personalizado: si pasás un color CSS (ej "#ff0000" o "red")
   *     tiene prioridad sobre 'variant'.
   */
  @Input() color?: string;

  @Output() clicked = new EventEmitter<void>();

  // Variables que inyectamos como estilos en línea (CSS variables)
  bgColor = '#141414'; // fondo por defecto (el que tenías)
  hoverBgColor = '#2f9b05'; // hover por defecto (verde) — se ajusta en ngAfterViewInit
  fgColor = '#ffffff'; // color del texto/ícono por defecto

  constructor(private host: ElementRef<HTMLElement>) {}

  onClick() {
    this.clicked.emit();
  }

  ngAfterViewInit(): void {
    // Buscamos el elemento real que tiene la clase .boton para leer estilos (si existe)
    const hostEl = this.host.nativeElement;
    const btn = hostEl.querySelector('.boton') as HTMLElement | null;
    // Si el dev pasa una color custom, lo usamos directamente y calculamos hover oscuro
    if (this.color) {
      this.bgColor = this.color;
      this.fgColor = this.isColorDark(this.color) ? '#ffffff' : '#000000';
      this.hoverBgColor = this.adjustColor(this.bgColor, -0.12); // oscurecer 12%
      return;
    }

    // Si hay variant y Bootstrap define variables CSS para botones, intentamos usarlas
    if (this.variant && btn) {
      // aplicamos la clase btn-<variant> temporalmente para forzar estilos computados
      btn.classList.add(`btn-${this.variant}`);
      // calculamos styles computados
      const cs = getComputedStyle(btn);
      const bsBg = cs.getPropertyValue('--bs-btn-bg').trim(); // variable de Bootstrap 5+
      const bsColor = cs.getPropertyValue('--bs-btn-color').trim();

      if (bsBg) {
        // Si Bootstrap tiene las CSS vars, las usamos (valor en formato var(--...))
        // Se usan referencias directas para mantener consistencia con el tema Bootstrap.
        // Usamos variables CSS para inyectarlas en template con [style.--...].
        // Aquí sólo marcamos los fallback string (no obligatorio).
        this.bgColor = 'var(--bs-btn-bg)';
        this.fgColor = 'var(--bs-btn-color)';
        // hover: intentamos usar la variable de hover si existe, si no la oscurecemos
        const bsHover = cs.getPropertyValue('--bs-btn-bg-hover').trim();
        this.hoverBgColor = bsHover || 'var(--bs-btn-bg)';
      } else {
        // fallback si no hay variables: leemos background-color y color computado
        const computedBg = cs.backgroundColor || '#141414';
        const computedFg = cs.color || '#ffffff';
        this.bgColor = computedBg;
        this.fgColor = computedFg;
        this.hoverBgColor = this.adjustColor(this.bgColor, -0.12); // oscurecer 12%
      }
      // removemos la clase adicional para no afectar el DOM si el host quería otra cosa
      btn.classList.remove(`btn-${this.variant}`);
      return;
    }

    // último fallback: dejamos los colores por defecto que ya definimos arriba
  }

  /* ---------- Funciones utilitarias ---------- */

  /**
   * isColorDark: intenta decidir si un color CSS es "oscuro" para elegir color de texto.
   * Acepta formatos: rgb(...), rgba(...), #hex o nombres simples (se usa canvas fallback).
   */
  private isColorDark(color: string): boolean {
    try {
      // crear elemento canvas para resolver color a RGB (maneja nombres y hex)
      const ctx = document.createElement('canvas').getContext('2d')!;
      ctx.fillStyle = color;
      const resolved = ctx.fillStyle; // en formato rgb(...) o #rrggbb
      // si es rgb(), parseamos
      const m = resolved.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
      let r = 20,
        g = 20,
        b = 20;
      if (m) {
        r = Number(m[1]);
        g = Number(m[2]);
        b = Number(m[3]);
      } else if (resolved.startsWith('#')) {
        const hex = resolved.slice(1);
        if (hex.length === 3) {
          r = parseInt(hex[0] + hex[0], 16);
          g = parseInt(hex[1] + hex[1], 16);
          b = parseInt(hex[2] + hex[2], 16);
        } else {
          r = parseInt(hex.slice(0, 2), 16);
          g = parseInt(hex.slice(2, 4), 16);
          b = parseInt(hex.slice(4, 6), 16);
        }
      }
      // luminancia aproximada
      const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
      return luminance < 0.6;
    } catch {
      return true;
    }
  }

  /**
   * adjustColor: oscurece/aclare un color RGB/hex por un factor (-0.12 => 12% oscuro)
   * Si recibe var(--...) devuelve el mismo string (no lo modifica).
   */
  private adjustColor(color: string, amount = -0.12): string {
    if (!color) return color;
    if (color.startsWith('var(')) return color; // no intentar modificar variables CSS
    try {
      // resolver color con canvas
      const ctx = document.createElement('canvas').getContext('2d')!;
      ctx.fillStyle = color;
      const resolved = ctx.fillStyle;
      const m = resolved.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
      let r = 20,
        g = 20,
        b = 20;
      if (m) {
        r = Number(m[1]);
        g = Number(m[2]);
        b = Number(m[3]);
      } else if (resolved.startsWith('#')) {
        const hex = resolved.slice(1);
        if (hex.length === 3) {
          r = parseInt(hex[0] + hex[0], 16);
          g = parseInt(hex[1] + hex[1], 16);
          b = parseInt(hex[2] + hex[2], 16);
        } else {
          r = parseInt(hex.slice(0, 2), 16);
          g = parseInt(hex.slice(2, 4), 16);
          b = parseInt(hex.slice(4, 6), 16);
        }
      }
      const factor = 1 + amount;
      r = Math.min(255, Math.max(0, Math.round(r * factor)));
      g = Math.min(255, Math.max(0, Math.round(g * factor)));
      b = Math.min(255, Math.max(0, Math.round(b * factor)));
      return `rgb(${r}, ${g}, ${b})`;
    } catch {
      return color;
    }
  }
}
