// factura-form-dialog.component.ts
import { Component, Input, Output, EventEmitter, inject, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { ButtonModule } from 'primeng/button';
import { TabViewModule } from 'primeng/tabview';
import { TableGenericNGComponent } from '../../tables/table-generic-ng/table-generic-ng.component';
import { InputDateComponent } from '../../input/input-date/input-date.component';
import { Factura, OrdenCompraItem, Remito } from 'src/app/core/models/database.type';
import { RemitoService } from 'src/app/features/facturas/services/remito.service';
import { OrdenCompraService } from 'src/app/features/orden-compra/services/orden-compra.service';
import { notFutureDateValidator } from '../../funtions/validator';


@Component({
  selector: 'app-factura-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    DialogModule,
    ReactiveFormsModule,
    InputNumberModule,
    ButtonModule,
    TabViewModule,
    TableGenericNGComponent,
    InputDateComponent
  ],
  templateUrl: './factura-form-dialog.component.html',
  providers: [CurrencyPipe]
})
export class FacturaFormDialogComponent implements OnInit {
  @Input() visible: boolean = false;
  @Input() facturaData?: Factura; // Para edición
  @Input() ordenCompraId!: number;
  @Input() isOrdenFinalizada: boolean = false;
  
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() onSave = new EventEmitter<{ success: boolean; message: string }>();
  @Output() onAddItem = new EventEmitter<void>();
  @Output() onEditItem = new EventEmitter<OrdenCompraItem>();
  @Output() onDeleteItem = new EventEmitter<OrdenCompraItem>();
  @Output() onAddRemito = new EventEmitter<void>();

  facturaForm!: FormGroup;
  maxDate: string = new Date().toISOString().split('T')[0];
  
  public _remitoService = inject(RemitoService);
  public _ordenCompraService = inject(OrdenCompraService);
  private fb = inject(FormBuilder);
  private currencyPipe = inject(CurrencyPipe);

  ngOnInit(): void {
    this.initForm();
    
    // Si hay datos de factura (modo edición), cargar el formulario
    if (this.facturaData) {
      this.loadFacturaData(this.facturaData);
    }
  }

  initForm(): void {
    this.facturaForm = this.fb.group({
      id: [null],
      primerosDigitosFactura: [null, [Validators.required, Validators.min(1)]],
      ultimosDigitosFactura: [null, [Validators.required, Validators.min(1)]],
      fecha: [null, [Validators.required, notFutureDateValidator]],
      importe: [null, [Validators.required, Validators.min(0.01)]],
    });
  }

  loadFacturaData(factura: Factura): void {
    const [puntoVenta, numeroFactura] = factura.numero_factura.split('-');
    
    let fechaFormatted = null;
    if (factura.fecha) {
      const fecha = new Date(factura.fecha);
      const year = fecha.getFullYear();
      const month = String(fecha.getMonth() + 1).padStart(2, '0');
      const day = String(fecha.getDate()).padStart(2, '0');
      fechaFormatted = `${year}-${month}-${day}`;
    }

    this.facturaForm.patchValue({
      id: factura.id,
      primerosDigitosFactura: parseInt(puntoVenta),
      ultimosDigitosFactura: parseInt(numeroFactura),
      fecha: fechaFormatted,
      importe: factura.importe,
    });

    this._remitoService.remitos.set(factura.remitos || []);
  }

  get isFormValid(): boolean {
    return this.facturaForm.valid;
  }

  getTotalCurrency = (value: number): string => {
    return this.currencyPipe.transform(value, '$', 'symbol', '1.2-2') || '$0.00';
  };

  formatDate(value: Date | string | null | undefined): string {
    if (!value) return '-';
    
    if (typeof value === 'string') {
      const [year, month, day] = value.split('-');
      if (year && month && day) {
        return `${day}/${month}/${year}`;
      }
    }
    
    if (value instanceof Date) {
      if (isNaN(value.getTime())) return '-';
      const day = String(value.getDate()).padStart(2, '0');
      const month = String(value.getMonth() + 1).padStart(2, '0');
      const year = value.getFullYear();
      return `${day}/${month}/${year}`;
    }
    
    return '-';
  }

  onSubmit(): void {
    if (!this.isFormValid) return;

    const facturaId = this.facturaForm.get('id')?.value;
    const primerosDigitos = this.facturaForm.get('primerosDigitosFactura')?.value;
    const ultimosDigitos = this.facturaForm.get('ultimosDigitosFactura')?.value;
    const fecha = this.facturaForm.get('fecha')?.value;
    const importe = this.facturaForm.get('importe')?.value;

    const numeroFactura = `${String(primerosDigitos).padStart(4, '0')}-${String(
      ultimosDigitos
    ).padStart(8, '0')}`;

    this.onSave.emit({
      success: true,
      message: facturaId ? 'Factura actualizada' : 'Factura creada',
    });
  }

  onCancel(): void {
    this.facturaForm.reset();
    this._remitoService.remitos.set([]);
    this.visibleChange.emit(false);
  }

  handleAddItem(): void {
    this.onAddItem.emit();
  }

  handleEditItem(item: OrdenCompraItem): void {
    this.onEditItem.emit(item);
  }

  handleDeleteItem(item: OrdenCompraItem): void {
    this.onDeleteItem.emit(item);
  }

  handleAddRemito(): void {
    this.onAddRemito.emit();
  }

  deleteRemito(item: Remito): void {
    this._remitoService.deleteItemRemito(item);
  }
}