import {
  Component,
  Input,
  Type,
  OnInit,
  inject,
  effect,
  computed,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  Factura,
  OrdenCompra,
  Remito,
} from 'src/app/core/models/database.type';
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
  type: 'default' | 'danger' | 'warning' | 'done' = 'default';
  estados: any[] = [];
  prefix: '$' | '' = '';
  numberPlaceHolder: string = '';
  currentAction: string = '';
  currentItem: any = null;
  iconClass = 'bi bi-check2-circle';
  //propiedades dropdwon
  dropdownOptions: any[] = [];
  dropdownPlaceholder: string = 'Seleccione una opción';
  dropdownOptionLabel: string = 'label';
  dropdownOptionValue: string = 'value';

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
  getRecibido(value: boolean): string {
    return value ? 'SI' : 'NO';
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

  todosLosItemsRecibidos(): boolean {
    if (
      !this.dataOrden?.orden_compra_items ||
      this.dataOrden.orden_compra_items.length === 0
    ) {
      return false; // Si no hay items, no se puede cerrar
    }
    return this.dataOrden.orden_compra_items.every(
      (item) => item.recibido === true
    );
  }

  // ✅ Nueva función para verificar si la orden está finalizada
  isOrdenFinalizada(): boolean {
    return this.dataOrden?.estado === 'FINALIZADA';
  }

  finalizarOrdenCompra(): void {
    if (!this.dataOrden) return;

    this._ordenCompraService.finalizarOC(this.dataOrden.id);
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
    const primerosDigitos = this.facturaForm.get(
      'primerosDigitosFactura'
    )?.value;
    const ultimosDigitos = this.facturaForm.get('ultimosDigitosFactura')?.value;
    const fecha = this.facturaForm.get('fecha')?.value;
    const importe = this.facturaForm.get('importe')?.value;

    const numeroFactura = `${String(primerosDigitos).padStart(4, '0')}-${String(
      ultimosDigitos
    ).padStart(8, '0')}`;

    let result;

    if (facturaId) {
      // EDITAR factura existente
      result = await this._facturaService.updateFactura(facturaId, {
        numero_factura: numeroFactura,
        fecha: fecha,
        importe: importe,
      });
    } else {
      // CREAR nueva factura
      result = await this._facturaService.createFactura({
        orden_compra_id: this.dataOrden.id,
        numero_factura: numeroFactura,
        fecha: fecha,
        importe: importe,
      });
    }

    // Mostrar resultado
    if (this.formResult) {
      this.formResult({
        success: result.success,
        message: result.message,
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

  // Formatea fecha (Date o string 'YYYY-MM-DD') a 'DD/MM/YYYY' (sin timezone)
  formatDateString(value: Date | string | null | undefined): string {
    if (!value) return '-';

    // Si es un objeto Date, ajustar por desfase de zona horaria
    if (value instanceof Date) {
      // Crear nueva fecha sumando 1 día para compensar el desfase UTC
      const adjustedDate = new Date(value);
      adjustedDate.setDate(adjustedDate.getDate() + 1);

      const day = String(adjustedDate.getDate()).padStart(2, '0');
      const month = String(adjustedDate.getMonth() + 1).padStart(2, '0');
      const year = adjustedDate.getFullYear();
      return `${day}/${month}/${year}`;
    }

    // Si es string 'YYYY-MM-DD', convertir a 'DD/MM/YYYY'
    if (typeof value === 'string') {
      const [y, m, d] = value.split('-');
      if (!y || !m || !d) return value;
      return `${d}/${m}/${y}`;
    }

    return '-';
  }

  deleteItemRemito(item: Remito) {
    this._remitoService.deleteItemRemito(item);
  }

  async editarFactura(factura: any) {
    // Parsear el número de factura
    const [puntoVenta, numeroFactura] = factura.numero_factura.split('-');

    // Convertir la fecha a formato ISO string para el input de fecha (sin desfase de zona horaria)
    let fechaFormatted = null;
    if (factura.fecha) {
      const fecha = new Date(factura.fecha);
      const year = fecha.getFullYear();
      const month = String(fecha.getMonth() + 1).padStart(2, '0');
      const day = String(fecha.getDate()).padStart(2, '0');
      fechaFormatted = `${year}-${month}-${day}`; // Formato YYYY-MM-DD
    }

    // Llenar el formulario
    this.facturaForm.patchValue({
      id: factura.id,
      primerosDigitosFactura: parseInt(puntoVenta),
      ultimosDigitosFactura: parseInt(numeroFactura),
      fecha: fechaFormatted,
      importe: factura.importe,
    });
    this._remitoService.remitos.set(factura.remitos);
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

      const numeroRemito = `${String(puntoVenta).padStart(4, '0')}-${String(
        numero
      ).padStart(8, '0')}`;

      // Guardar fecha como string YYYY-MM-DD para evitar desfase de zona horaria
      let fecha: string | undefined;
      if (fechaValue) {
        if (typeof fechaValue === 'string') {
          fecha = fechaValue;
        } else {
          const d = new Date(fechaValue);
          const year = d.getFullYear();
          const month = String(d.getMonth() + 1).padStart(2, '0');
          const day = String(d.getDate()).padStart(2, '0');
          fecha = `${year}-${month}-${day}`;
        }
      }

      // Crear remito temporal (fecha como string)
      const nuevoRemito = {
        id: `temp-${Date.now()}` as any, // ID temporal único
        numero_remito: numeroRemito,
        fecha: fecha as any, // forzar tipo para evitar error TS
        factura_id: {} as Factura,
      };

      this._remitoService.addItemRemito(nuevoRemito);
      this.cancelAddRemito();
    }
  }

  // ==================== MODAL POP-UP ====================

  /**
   * Maneja la confirmación del modal
   */
  async handleAccept(value?: any) {
    console.log('Acción aceptada:', this.currentAction, 'Valor:', value);

    switch (this.currentAction) {
      case 'itemRecibido':
        await this.confirmarItemRecibido(this.currentItem);
        break;
      case 'editPriceItem':
        await this.editarPrecioItem(this.currentItem, value);
        break;
      case 'relacionarFactura':
        await this.relacionarFactura(this.currentItem, value);
        break;
      case 'actualizarFechaPago':
        await this.actualizarFechaPago(this.currentItem, value);
        break;

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
    this.prefix = '';
    this.iconClass = 'bi bi-check2-circle';
    this.type = 'done';
    this.showModal = true;
  }
  openEditOrdenCompraItem(item: any) {
    this.currentAction = 'editPriceItem';
    this.currentItem = item;
    this.type = 'warning';
    this.prefix = '$';
    this.titleModal = `Cambiando el SUBTOTAL del item  `;
    this.descriptionModal = `Usted va a cambiar el subtotal del item  "${item.pedido_item_id?.productos?.nombre}, ${item.cantidad}  ${item.pedido_item_id?.unidad_medida_id.nombre}"`;
    this.typeModal = 'number';
    this.showModal = true;
  }
  openRelacionarFacturaModal(item: any) {
    this.currentAction = 'relacionarFactura';
    this.currentItem = item;
    this.type = 'default';
    this.prefix = '';
    this.titleModal = `Relacionar item ${item.pedido_item_id?.productos?.nombre}"`;
    this.descriptionModal = '';
    this.typeModal = 'dropdown';
    this.dropdownOptions =
      this.dataOrden?.facturas?.map((factura) => ({
        label: `${factura.numero_factura} - $${factura.importe.toFixed(
          2
        )} - ${this.formatDate(factura.fecha)}`,
        value: factura,
      })) || [];

    this.dropdownPlaceholder = 'Seleccione una factura';
    this.dropdownOptionLabel = 'label';
    this.dropdownOptionValue = 'value';

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
            message: 'Error al marcar el item como recibido',
          });
        }
        return;
      }

      // Si todo salió bien
      if (this.formResult) {
        this.formResult({
          success: true,
          message: 'Item marcado como recibido correctamente',
        });
      }

      // ✅ No es necesario recargar, la signal se actualiza automáticamente en el servicio
    } catch (error) {
      console.error('Error inesperado al marcar item como recibido:', error);
      if (this.formResult) {
        this.formResult({
          success: false,
          message: 'Error inesperado al marcar el item como recibido',
        });
      }
    }
  }
  async editarPrecioItem(item: any, nuevoPrecio: number) {
    try {
      if (!nuevoPrecio || nuevoPrecio <= 0) {
        if (this.formResult) {
          this.formResult({
            success: false,
            message: 'Debe ingresar un precio válido mayor a 0',
          });
        }
        return;
      }

      console.log(
        'Editando precio del item:',
        item,
        'Nuevo precio:',
        nuevoPrecio
      );

      const { data, error } = await this._ordenCompraService.editPriceItem(
        item,
        nuevoPrecio
      );

      if (error) {
        console.error('Error al editar precio del item:', error);
        if (this.formResult) {
          this.formResult({
            success: false,
            message: 'Error al actualizar el precio del item',
          });
        }
        return;
      }

      // Si todo salió bien
      if (this.formResult) {
        this.formResult({
          success: true,
          message: 'Precio del item actualizado correctamente',
        });
      }

      // ✅ No es necesario recargar, la signal se actualiza automáticamente en el servicio
    } catch (error) {
      console.error('Error inesperado al editar precio:', error);
      if (this.formResult) {
        this.formResult({
          success: false,
          message: 'Error inesperado al actualizar el precio',
        });
      }
    }
  }
  async relacionarFactura(item: any, factura: Factura) {
    try {
      if (!factura) {
        if (this.formResult) {
          this.formResult({
            success: false,
            message: 'Debe seleccionar una factura',
          });
        }
        return;
      }

      console.log(
        'Relacionando item con factura:',
        item,
        'Factura ID:',
        factura
      );

      // Llamar al servicio para relacionar (implementarás esto después)
      const { data, error } =
        await this._ordenCompraService.relacionarItemConFactura(
          item.id,
          factura
        );

      if (error) {
        console.error('Error al relacionar item con factura:', error);
        if (this.formResult) {
          this.formResult({
            success: false,
            message: 'Error al relacionar el item con la factura',
          });
        }
        return;
      }

      // Si todo salió bien
      if (this.formResult) {
        this.formResult({
          success: true,
          message: 'Item relacionado con la factura correctamente',
        });
      }
    } catch (error) {
      console.error('Error inesperado al relacionar item con factura:', error);
      if (this.formResult) {
        this.formResult({
          success: false,
          message: 'Error inesperado al relacionar el item',
        });
      }
    }
  }

  /**
   * Abre el modal para actualizar la fecha de pago de una factura
   */
  openActualizarFechaPago(factura: any) {
    this.currentAction = 'actualizarFechaPago';
    this.currentItem = factura;
    this.type = 'default';
    this.prefix = '';
    this.titleModal = 'Actualizar Fecha de Pago';
    this.descriptionModal = `Actualizar la fecha de pago de la factura "${factura.numero_factura}"`;
    this.typeModal = 'date';
    this.showModal = true;
  }

  /**
   * Actualiza la fecha de pago de una factura
   */
  async actualizarFechaPago(factura: any, nuevaFecha: string) {
    try {
      if (!nuevaFecha) {
        if (this.formResult) {
          this.formResult({
            success: false,
            message: 'Debe seleccionar una fecha válida',
          });
        }
        return;
      }

      console.log(
        'Actualizando fecha de pago de la factura:',
        factura,
        'Nueva fecha:',
        nuevaFecha
      );

      const { data, error } =
        await this._ordenCompraService.actualizarFechaPagoFactura(
          factura.id,
          nuevaFecha
        );

      if (error) {
        console.error('Error al actualizar fecha de pago:', error);
        if (this.formResult) {
          this.formResult({
            success: false,
            message: 'Error al actualizar la fecha de pago',
          });
        }
        return;
      }

      // Si todo salió bien
      if (this.formResult) {
        this.formResult({
          success: true,
          message: 'Fecha de pago actualizada correctamente',
        });
      }

      // ✅ No es necesario recargar, la signal se actualiza automáticamente en el servicio
    } catch (error) {
      console.error('Error inesperado al actualizar fecha de pago:', error);
      if (this.formResult) {
        this.formResult({
          success: false,
          message: 'Error inesperado al actualizar la fecha de pago',
        });
      }
    }
  }
}
