import {
  Component,
  effect,
  inject,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
  WritableSignal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ProductoService } from '../../productos/service/producto-service.service';
import {
  InputModalSelectorComponent,
  SelectorData,
} from 'src/app/shared/input/input-modal-selector/input-modal-selector.component';
import { Producto, UnidadMedida } from 'src/app/core/models/database.type';
import { InputNumberModule } from 'primeng/inputnumber';
import {
  AutoCompleteCompleteEvent,
  AutoCompleteModule,
} from 'primeng/autocomplete';
import { UnidadesMedidaService } from '../../productos/service/unidades-medida-service';
import { ProveedorService } from '../../proveedores/services/proveedor.service';
import { ButtonElegantComponent } from 'src/app/shared/buttons/button-elegant/button-elegant.component';
import { InputBoxComponent } from 'src/app/shared/input/input-box/input-box.component';
import { PresupuestoService } from '../presupuesto.service';

@Component({
  selector: 'app-presupuesto-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    InputModalSelectorComponent,
    InputNumberModule,
    AutoCompleteModule,
    ButtonElegantComponent,
    InputBoxComponent,
  ],
  templateUrl: './presupuesto-form.component.html',
  styleUrls: ['./presupuesto-form.component.css'],
})
export class PresupuestoFormComponent implements OnInit,OnChanges {
  @Input() formResult?: (result: {
    severity?: string;
    success: boolean;
    message: string;
  }) => void;
  @Input() onSaveSuccess?: () => void;
  @Input() producto_id?: number;
  @Input() unidad_medida_id?: number;
  @Input() cantidad?: number;
  private _productoService = inject(ProductoService);
  private _unididadMedidas = inject(UnidadesMedidaService);
  private _proveedorService = inject(ProveedorService);
  private fb = inject(FormBuilder);
  private _presupuestoService = inject(PresupuestoService);
  productoData: SelectorData[] = [];
  presupuestoForm!: FormGroup;
  proovedores = this._proveedorService.proveedores;
  proveedoresData: SelectorData[] = [];
  filteredMedidasData: any[] = [];
  productos: WritableSignal<Producto[]> = this._productoService.productos;
  medidasData: WritableSignal<UnidadMedida[]> =
    this._unididadMedidas.Unidadmedidas;
  selectedMedida: any[] | undefined;

  constructor() {
    effect(() => {
      const lista = this.proovedores();
      this.proveedoresData = lista.map((proveedor) => ({
        id: proveedor.id,
        name: proveedor.nombre,
      }));
    });
  }
  async ngOnInit(): Promise<void> {
    this.presupuestoForm = this.fb.group({
      proveedor_id: [null, Validators.required],
      producto_id: [null, Validators.required],
      cantidad: [null, [Validators.required, Validators.min(0)]],
      unidad_medida: [null, Validators.required],
      importe: [0, [Validators.required, Validators.min(0)]],
    });
    await this.loadMedidas();
    await this.loadProductos();
    this.patchValues()
    // Normalizar el valor de unidad_medida_id al id después de seleccionar
    this.presupuestoForm
      .get('unidad_medida_id')
      ?.valueChanges.subscribe((val) => {
        if (val && typeof val === 'object' && val.id) {
          this.presupuestoForm
            .get('unidad_medida_id')
            ?.setValue(val.id, { emitEvent: false });
        }
      });
  }
  ngOnChanges(changes: SimpleChanges): void {
    // Solo si el formulario ya está creado
    if (this.presupuestoForm) {
      this.patchValues();
    }
  }
  async loadMedidas() {
    if (this.medidasData().length === 0) {
      const data = await this._unididadMedidas.getAllMedidas();
      // FIX: Asegurarse de no pasar null a la señal
      this.medidasData.set(data || []);
    }
  }

  async loadProductos() {
    if (this.productos().length === 0) {
      const data = await this._productoService.getAllProductos();
      // FIX: Asegurarse de no pasar null a la señal
      this.productos.set(data || []);
    }
    const productosActuales = this.productos();
    if (productosActuales) {
      this.productoData = productosActuales.map((producto) => ({
        id: producto.id,
        name: producto.nombre,
        descripcion: producto.descripcion,
      }));
    }
  }
  async loadProveedores() {
    if (this.proovedores().length === 0) {
      const data = await this._proveedorService.getAllProveedores();
      // FIX: Asegurarse de no pasar null a la señal
      this.proovedores.set(data || []);
    }
  }

  patchValues(): void {
     // Busca el objeto de unidad de medida por id
    let unidadObj: UnidadMedida | null = null;
    if (this.unidad_medida_id) {
      unidadObj = this.medidasData().find(m => m.id === this.unidad_medida_id) ?? null;
    }
    this.presupuestoForm.patchValue({
      producto_id: this.producto_id ?? null,
      unidad_medida: unidadObj,
      cantidad: this.cantidad ?? null,
    });
  }
  filterData(event: AutoCompleteCompleteEvent) {
    const query = event.query.toLowerCase();
    // FIX: Acceder al valor de la señal con () y tipar el parámetro 'medida'
    this.filteredMedidasData = this.medidasData().filter(
      (medida: UnidadMedida) => {
        return medida.nombre.toLowerCase().includes(query);
      }
    );
  }
  async onSubmit() {
    this.presupuestoForm.markAllAsTouched();

    if (this.presupuestoForm.invalid) {
      this.formResult?.({
        success: false,
        message: 'Formulario inválido. Por favor verifica los datos.',
      });
      return;
    }

    // Normalizar el valor de unidad_medida_id al id si es un objeto
      let formValue = { ...this.presupuestoForm.value };
    if (
      formValue.unidad_medida &&
      typeof formValue.unidad_medida === 'object' &&
      formValue.unidad_medida.id
    ) {
      formValue.unidad_medida_id = formValue.unidad_medida.id;
      delete formValue.unidad_medida;
    }
    console.log(formValue);

    // Avisar al padre que estamos guardando (opcional si querés mostrar "cargando...")
    this.formResult?.({
      success: true,
      message: 'Guardando producto en el pedido...',
    });

    const { data, error } = await this._presupuestoService.addPresupuesto(
      formValue
    );

    if (error) {
      this.formResult?.({
        success: false,
        message: 'No se pudo guardar el producto. ' + error.message,
      });
    } else {
      this.formResult?.({
        success: true,
        message: 'El producto fue agregado correctamente ✅',
      });

      if (this.onSaveSuccess) {
        this.onSaveSuccess(); // Esto cierra el sidebar
      }

      this.presupuestoForm.reset();
    }
  }
}
