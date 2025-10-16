import { Component, Input, Type, OnInit, inject, effect, computed, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Factura, OrdenCompra, Remito } from 'src/app/core/models/database.type';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { TableGenericNGComponent } from 'src/app/shared/tables/table-generic-ng/table-generic-ng.component';
import { getBadgeClassByOC } from 'src/app/shared/funtions/pedidosFuntions';
import { ButtonElegantComponent } from 'src/app/shared/buttons/button-elegant/button-elegant.component';
import { DialogModule } from 'primeng/dialog';
import { InputNumber, InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { RemitoService } from '../../facturas/services/remito.service';
import { FacturaService } from '../../facturas/services/factura.service';
import { OrdenCompraService } from '../services/orden-compra.service';
import { InputDateComponent } from 'src/app/shared/input/input-date/input-date.component';
import { AccordionModule } from 'primeng/accordion';
import { TooltipModule } from 'primeng/tooltip';
import { notFutureDateValidator } from 'src/app/shared/funtions/validator';
import { PopUpNgComponent } from 'src/app/shared/modal/pop-up-ng/pop-up-ng.component';
@Component({
  selector: 'app-orden-compra-detail',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    TableGenericNGComponent,
    DividerModule,
    ButtonElegantComponent,
    DialogModule,
    InputNumberModule,
    InputTextModule,
    FormsModule,
    ReactiveFormsModule,
    ButtonModule,
    InputDateComponent,
    AccordionModule,
    TooltipModule,
    PopUpNgComponent,
  ],
  templateUrl: './orden-compra-detail.component.html',
  styleUrls: ['./orden-compra-detail.component.css'],
})
export class OrdenCompraDetailComponent implements OnInit {

  @Input() formResult?: (result: {
    severity?: string;
    success: boolean;
    message: string;
  }) => void;
  
  showAddFactura: boolean = false;
  showAddRemito: boolean = false;
  facturaForm!: FormGroup;
  remitoForm!: FormGroup;
  
  public _remitoService = inject(RemitoService);
  public _facturaService = inject(FacturaService);
  
  public _ordenCompraService = inject(OrdenCompraService);
  private cdr = inject(ChangeDetectorRef);
  
  // ✅ Getter para acceso más fácil en el template
  get dataOrden() {
    return this._ordenCompraService.ordenCompra();
  }
  
  // ✅ Computed signals para las tablas (se actualizan automáticamente)
  
  
  public remitos: Remito[] | null = this._remitoService.remitos();
  
  // Fecha máxima para remitos y facturas (hoy)
  public maxDate: string = new Date().toISOString().split('T')[0];
  
  // Propiedades del modal pop-up
  showModal: boolean = false;
  titleModal: string = '';
  descriptionModal: string = '';
  typeModal: 'number' | 'date' | 'dropdown' | 'none' = 'none';
  numberPlaceHolder: string = '';
  currentAction: string = '';
  currentItem: any = null;
  
  constructor(private fb: FormBuilder) {
    effect(() => {
      this.remitos = this._remitoService.remitos() ?? [];
    });
    
    // ✅ Effect para forzar detección cuando cambia la orden
    effect(() => {
      this._ordenCompraService.ordenCompra();
      this._ordenCompraService.facturas();
      this._ordenCompraService.presupuestos();
      this._ordenCompraService.ordenCompraItemsSignal();
      this.cdr.markForCheck();
    });
  }

  ngOnInit(): void {
    this.initFacturaForm();
    this.initRemitoForm();
  }

  initFacturaForm(): void {
    this.facturaForm = this.fb.group({
      id: [null], // Para edición
      primerosDigitosFactura: [null, [Validators.required, Validators.min(1)]],
      ultimosDigitosFactura: [null, [Validators.required, Validators.min(1)]],
      fecha: [null, [Validators.required, notFutureDateValidator]],
      importe: [null, [Validators.required, Validators.min(0.01)]],
    });
  }

  initRemitoForm(): void {
    this.remitoForm = this.fb.group({
      puntoVentaRemito: [null, [Validators.required, Validators.min(1)]],
      numeroRemito: [null, [Validators.required, Validators.min(1)]],
      fecha: [null, [Validators.required, notFutureDateValidator]],
    });
  }

  getTotalCurrency(value: number): string {
    return value ? '$' + value.toFixed(2) : '$0.00';
  }

  getImporteCurrency(value: number): string {
    return value ? '$' + value.toFixed(2) : '$0.00';
  }
  getFactura(value: string): string {
    return value ? value : 'Sin Factura';
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

  // ==================== FACTURA ====================

  async addEditFactura() {
    if (!this.facturaForm.valid || !this.dataOrden) {
      return;
    }

    const facturaId = this.facturaForm.get('id')?.value;
    const primerosDigitos = this.facturaForm.get('primerosDigitosFactura')?.value;
    const ultimosDigitos = this.facturaForm.get('ultimosDigitosFactura')?.value;
    const fecha = this.facturaForm.get('fecha')?.value;
    const importe = this.facturaForm.get('importe')?.value;

    const numeroFactura = `${String(primerosDigitos).padStart(4, '0')}-${String(ultimosDigitos).padStart(8, '0')}`;

    let result;

    if (facturaId) {
      // EDITAR factura existente
      result = await this._facturaService.updateFactura(facturaId, {
        numero_factura: numeroFactura,
        fecha: fecha,
        importe: importe
      });
    } else {
      // CREAR nueva factura
      result = await this._facturaService.createFactura({
        orden_compra_id: this.dataOrden.id,
        numero_factura: numeroFactura,
        fecha: fecha,
        importe: importe
      });
    }

    // Mostrar resultado
    if (this.formResult) {
      this.formResult({
        success: result.success,
        message: result.message
      });
    }

    if (result.success) {
      this.cancelAdd();
      // Recargar la orden de compra para ver los cambios
      await this._ordenCompraService.getOCById(this.dataOrden.id);
    }
  }

  cancelAdd() {
    this.facturaForm.reset();
    this._facturaService.clearFactura();
    this.showAddFactura = false;
  }

  deleteItemRemito(item: Remito) {
    this._remitoService.deleteItemRemito(item);
  }

  async editarFactura(factura: any) {
    // Cargar la factura y sus remitos
    await this._facturaService.loadFacturaForEdit(factura.id);

    // Parsear el número de factura
    const [puntoVenta, numeroFactura] = factura.numero_factura.split('-');

    // Llenar el formulario
    this.facturaForm.patchValue({
      id: factura.id,
      primerosDigitosFactura: parseInt(puntoVenta),
      ultimosDigitosFactura: parseInt(numeroFactura),
      fecha: new Date(factura.fecha),
      importe: factura.importe
    });

    // Abrir el modal
    this.showAddFactura = true;
  }

  // ==================== REMITO ====================

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

      // Convertir fecha
      let fecha: Date | undefined;
      if (fechaValue) {
        fecha = typeof fechaValue === 'string' ? new Date(fechaValue) : fechaValue;
      }

      // Crear remito temporal
      const nuevoRemito: Partial<Remito> = {
        id: `temp-${Date.now()}` as any, // ID temporal único
        numero_remito: numeroRemito,
        fecha: fecha,
      };

      this._remitoService.addItemRemito(nuevoRemito as Remito);
      this.cancelAddRemito();
    }
  }

  // ==================== MODAL POP-UP ====================

  /**
   * Maneja la confirmación del modal
   */
  handleAccept(value?: any) {
    console.log('Acción aceptada:', this.currentAction, 'Valor:', value);
    
    switch (this.currentAction) {
      case 'itemRecibido':
        this.confirmarItemRecibido(this.currentItem);
        break;
      // Agregar más casos según necesites
      default:
        console.log('Acción no manejada');
    }
    
    this.closeModal();
  }

  /**
   * Maneja la cancelación del modal
   */
  handleCancel() {
    console.log('Acción cancelada');
    this.closeModal();
  }

  /**
   * Cierra el modal y limpia las propiedades
   */
  closeModal() {
    this.showModal = false;
    this.currentAction = '';
    this.currentItem = null;
  }

  // ==================== ACCIONES DE ITEMS ====================

  /**
   * Abre el modal de confirmación para marcar un item como recibido
   */
  openItemRecibidoModal(item: any) {
    this.currentAction = 'itemRecibido';
    this.currentItem = item;
    this.titleModal = 'Confirmar recepción';
    this.descriptionModal = `¿Confirma que recibió el producto "${item.pedido_item_id?.productos?.nombre}"?`;
    this.typeModal = 'none';
    this.showModal = true;
  }

  /**
   * Confirma que el item fue recibido
   */
  async confirmarItemRecibido(item: any) {
    try {
      console.log('Marcando item como recibido:', item);
      
      const { data, error } = await this._ordenCompraService.itemRecibido(item);
      
      if (error) {
        console.error('Error al marcar item como recibido:', error);
        if (this.formResult) {
          this.formResult({
            success: false,
            message: 'Error al marcar el item como recibido'
          });
        }
        return;
      }
      
      // Si todo salió bien
      if (this.formResult) {
        this.formResult({
          success: true,
          message: 'Item marcado como recibido correctamente'
        });
      }
      
      // ✅ No es necesario recargar, la signal se actualiza automáticamente en el servicio
    } catch (error) {
      console.error('Error inesperado al marcar item como recibido:', error);
      if (this.formResult) {
        this.formResult({
          success: false,
          message: 'Error inesperado al marcar el item como recibido'
        });
      }
    }
  }

 
}
