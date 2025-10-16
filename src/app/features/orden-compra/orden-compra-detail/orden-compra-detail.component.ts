import { Component, Input, Type, OnInit, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrdenCompra, Remito } from 'src/app/core/models/database.type';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { TableGenericNGComponent } from 'src/app/shared/tables/table-generic-ng/table-generic-ng.component';
import { getBadgeClassByOC } from 'src/app/shared/funtions/pedidosFuntions';
import { ButtonElegantComponent } from 'src/app/shared/buttons/button-elegant/button-elegant.component';
import { DialogModule } from 'primeng/dialog';
import { InputNumber, InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from "@angular/forms";
import { ButtonModule } from 'primeng/button';
import { RemitoService } from '../../facturas/services/remito.service';
import { FacturaService } from '../../facturas/services/factura.service';
import { InputDateComponent } from 'src/app/shared/input/input-date/input-date.component';
@Component({
  selector: 'app-orden-compra-detail',
  standalone: true,
  imports: [CommonModule, CardModule, TableGenericNGComponent, DividerModule, ButtonElegantComponent, DialogModule, InputNumberModule, InputTextModule, FormsModule, ReactiveFormsModule, ButtonModule, InputDateComponent],
  templateUrl: './orden-compra-detail.component.html',
  styleUrls: ['./orden-compra-detail.component.css']
})
export class OrdenCompraDetailComponent implements OnInit {
  sidebarVisible = false;
  sidebarTitle = '';
  componentToLoad: Type<any> | null = null;
  sidebarInputs: Record<string, unknown> | undefined; // Para los inputs del componente dinámico
  @Input() dataOrden: OrdenCompra | null = null;
  @Input() formResult?: (result: { severity?: string; success: boolean; message: string }) => void;
  showAddFactura: boolean = false;
  showAddRemito: boolean = false;
  facturaForm!: FormGroup;
  remitoForm!: FormGroup;
  public _remitoService = inject(RemitoService);
  public _facturaService = inject(FacturaService);
  public remitos: Remito[] | null = this._remitoService.remitos();
  constructor(private fb: FormBuilder) {
    effect(() => {
      this.remitos = this._remitoService.remitos() ?? [];
    });
  }

  ngOnInit(): void {
    this.initForm();
    this.initRemitoForm();
  }

  initForm(): void {
    this.facturaForm = this.fb.group({
      primerosDigitosFactura: [null, [Validators.required, Validators.min(1)]],
      ultimosDigitosFactura: [null, [Validators.required, Validators.min(1)]],
      numeroRemito: ['']
    });
  }

  initRemitoForm(): void {
    this.remitoForm = this.fb.group({
      puntoVentaRemito: [null, [Validators.required, Validators.min(1)]],
      numeroRemito: [null, [Validators.required, Validators.min(1)]],
      fecha: [null, [Validators.required]]
    });
  }

  getTotalCurrency(value: number): string {
    return value ? '$' + value.toFixed(2) : '$0.00';
  }

  getImporteCurrency(value: number): string {
    return value ? '$' + value.toFixed(2) : '$0.00';
  }

  formatDate(value: Date | string | null | undefined): string {
    if (!value) return '-';
    
    const date = typeof value === 'string' ? new Date(value) : value;
    
    if (!(date instanceof Date) || isNaN(date.getTime())) return '-';
    
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    
    return `${day}/${month}/${year}`;
  }
  getBadgeClass(estado: string) {
    return getBadgeClassByOC(estado);
  }

  isPrecioValid(): boolean {
    return this.facturaForm.valid;
  }

  onEnterPrecio(): void {
    if (this.isPrecioValid()) {
      this.addEditFactura();
    }
  }

  cancelAdd() {
    this.facturaForm.reset();
    this.showAddFactura = false;
  }

  // Métodos para el modal de remito
  openAddRemito(): void {
    this.showAddRemito = true;
  }

  cancelAddRemito(): void {
    this.remitoForm.reset();
    this.showAddRemito = false;
  }

  agregarRemito(): void {
    if (this.remitoForm.valid) {
      const puntoVenta = this.remitoForm.get('puntoVentaRemito')?.value;
      const numero = this.remitoForm.get('numeroRemito')?.value;
      const fechaValue = this.remitoForm.get('fecha')?.value;

      const numeroRemito = `${String(puntoVenta).padStart(4, '0')}-${String(numero).padStart(8, '0')}`;

      // Convertir fecha string a Date
      let fecha: Date | undefined;
      if (fechaValue) {
        if (typeof fechaValue === 'string') {
          fecha = new Date(fechaValue);
        } else if (fechaValue instanceof Date) {
          fecha = fechaValue;
        }
      }

      // Crear objeto Remito temporal (sin guardar en BD aún)
      const nuevoRemito: Partial<Remito> = {
        id: this._remitoService.remitos().length, // ID temporal para la tabla
        numero_remito: numeroRemito,
        fecha: fecha
        // factura_id se asignará cuando se guarde la factura
      };

      console.log('Agregando remito:', nuevoRemito);

      // Agregar al servicio
      this._remitoService.addItemRemito(nuevoRemito as Remito);

      console.log("REMITOS SIGNAL", this._remitoService.remitos())
      this.cancelAddRemito();
    }
  }

  addEditFactura() {
    if (this.facturaForm.valid) {
      const primerosDigitos = this.facturaForm.get('primerosDigitosFactura')?.value;
      const ultimosDigitos = this.facturaForm.get('ultimosDigitosFactura')?.value;
      const numeroRemito = this.facturaForm.get('numeroRemito')?.value;

      const numeroFactura = `${primerosDigitos}-${ultimosDigitos}`;

      console.log('Número de factura:', numeroFactura);
      console.log('Número de remito:', numeroRemito);

      // Aquí puedes agregar la lógica para guardar los datos

      this.cancelAdd();
    }
  }
  deleteItemRemito(item: Remito) {
    this._remitoService.deleteItemRemito(item);
    //me falta agregar  para eliminar el servicio
  }
}
