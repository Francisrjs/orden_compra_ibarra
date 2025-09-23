import { Component, inject, Input, OnInit, Output, WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProductoService } from '../../productos/service/producto-service.service';
import { InputModalSelectorComponent, SelectorData } from 'src/app/shared/input/input-modal-selector/input-modal-selector.component';
import { Producto, UnidadMedida } from 'src/app/core/models/database.type';
import { InputNumberModule } from 'primeng/inputnumber';
import { AutoCompleteCompleteEvent, AutoCompleteModule } from 'primeng/autocomplete';
import { UnidadesMedidaService } from '../../productos/service/unidades-medida-service';
import { PedidoService } from '../../pedidos/services/pedido.service';
import { ProveedorService } from '../../proveedores/services/proveedor.service';
import { ButtonElegantComponent } from 'src/app/shared/buttons/button-elegant/button-elegant.component';

@Component({
  selector: 'app-presupuesto-form',
  standalone: true,
  imports: [CommonModule,FormsModule,ReactiveFormsModule,InputModalSelectorComponent,InputNumberModule,AutoCompleteModule,ButtonElegantComponent],
  templateUrl: './presupuesto-form.component.html',
  styleUrls: ['./presupuesto-form.component.css']
})
export class PresupuestoFormComponent implements OnInit{
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
    private _proveedorService = inject(ProveedorService)
  private fb = inject(FormBuilder);
  productoData: SelectorData[] = [];
  presupuestoForm!:FormGroup;
   proovedores= this._proveedorService.proveedores
   proveedoresData: SelectorData[] = [];
  filteredMedidasData: any[] = [];
    productos: WritableSignal<Producto[]> = this._productoService.productos;
    medidasData: WritableSignal<UnidadMedida[]> =
      this._unididadMedidas.Unidadmedidas;
  selectedMedida: any[] | undefined;

  async ngOnInit(): Promise<void> {
      this.presupuestoForm = this.fb.group({
        producto_id: [null, Validators.required],
        cantidad: [null, [Validators.required, Validators.min(1)]],
        unidad_medida_id: [null, Validators.required],
        importe:[null, Validators.required, Validators.min(1)]
      });
     await this.loadMedidas();
    await this.loadProductos();
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
}

  patchValues(): void{
    if(this.unidad_medida_id||this.producto_id){
      this.presupuestoForm.patchValue({
        producto_id: this.producto_id,
        unidad_medida_id: this.unidad_medida_id,
        cantidad: this.cantidad
      })
    }
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

    const formValue = {
      ...this.presupuestoForm.value,
    };

    // Avisar al padre que estamos guardando (opcional si querés mostrar "cargando...")
    this.formResult?.({
      success: true,
      message: 'Guardando producto en el pedido...',
    });

    const { data, error } = await this._productoService.addProducto(formValue);

    if (error) {
      // ⬇️ CAMBIO AQUÍ: Usa el callback en lugar de _messageService
      this.formResult?.({
        success: false,
        message: 'No se pudo guardar el producto. ' + error.message,
      });
    } else {
      // ⬇️ CAMBIO AQUÍ: Usa el callback en lugar de _messageService
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