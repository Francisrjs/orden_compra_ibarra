import { Time } from '@angular/common';
import { User } from '@supabase/supabase-js';

export type EstadoPedido =
  | 'En Creacion'
  | 'En Proceso de Aprobacion'
  | 'En Proceso de Entrega'
  | 'Cerrado'
  | 'Rechazado';
export type tipoOC=
  | 'SOLICITUD'
  | 'PRESUPUESTO'
  | 'SIN ESPECIFICAR'
export type EstadoItemPedido =
  | 'Pendiente'
  | 'Aprobado'
  | 'Rechazado'
  | 'Aprobado parcial'
  | 'En Envio';
export type EstadoOC =
  | 'Borrador'
  | 'EN PROCESO'
  | 'CERRADA'
  | 'ABIERTA'
  | 'CANCELADA';
export type Areas =
  | 'LOGISTICA'
  | 'ADMINISTRACION'
  | 'OBRAS'
  | 'SISTEMAS'
  | 'TALLER'
  | 'PREDIO';

export type TiempoItem = 'EN PLAZO' | 'POR VENCER' | 'DEMORADO';

// Ahora, las interfaces para cada tabla de la base de datos
export interface UnidadMedida {
  id: number;
  nombre: string;
  abreviatura?: string;
}

export interface Categoria {
  id: number;
  nombre: string;
  descripcion?: string;
  icon_text?: string;
}

export interface Proveedor {
  id: number;
  nombre: string;
  contacto?: string;
  email?: string;
  telefono?: string;
  domicilio?: string;
  cuit?: string;
}

export interface Producto {
  id: number;
  nombre: string;
  descripcion?: string;
  categoria_id: number;
  unidad_medida_id: number;

  // Opcional: para mostrar datos relacionados en el frontend
  categoria?: Categoria;
  unidades_medida?: UnidadMedida;
}

export interface Pedido {
  id: number;
  numero_pedido: string;
  titulo?: string;
  area?: string;
  responsable_id: string; // Corresponde al UUID del usuario en Supabase Auth
  urgente: boolean;
  plazo_entrega?: string; // Formato 'YYYY-MM-DD'
  estado: EstadoPedido;
  fecha_creacion: string; // Formato ISO 8601
  usuario: string;
  tiempo_item: TiempoItem;
  //relaciones opcionales
  pedido_items?: PedidoItem[];
  nombre_responsable?: string; // Campo opcional que viene de la vista
  email_responsable?: string; // Campo opcional que viene de la vista
}

export interface PedidoItem {
  id: number;
  pedido_id: number;
  producto_id: number;
  cantidad: number;
  estado: EstadoItemPedido;
  justificacion_rechazo?: string;
  razon_pedido?: string;
  unidad_medida_id: number;
  link_referencia: string;
  unidad_medida: UnidadMedida;
  //Relacion opcional
  producto?: Producto;
  unidad_medida_id_aceptada?: UnidadMedida;
  cantidad_aceptada?: number;
}

export interface OrdenCompra {
  id: number;
  numero_oc?: string;
  jefe_compra_id: User; // UUID del usuario
  proveedor_id?: Proveedor;
  estado: EstadoOC;
  fecha_creacion: string;
  notas?: string;
  condicion_entrega:string;
  fecha_pago?:Date;
  total:number;
  condicion_pago:string;
  orden_compra_items?:OrdenCompraItem[];
  proveedores?: Proveedor;
  tipo?:tipoOC
  presupuesto?:Presupuesto[];
  facturas?:Factura[];
}

export interface Remito{
  id:number;
  numero_remito:string;
  factura_id:Factura;
  fecha:Date;
  creado?:boolean;
}
export interface OrdenCompraItem {
  id: number;
  orden_compra_id?: OrdenCompra;
  pedido_item_id?: number;
  precio_unitario?: number;
  cantidad: number;
  subtotal: number;
  estado?: EstadoItemPedido;

  // Opcional: para mostrar datos relacionados
  pedido_items?: PedidoItem;
  producto_id?: number;
  factura_id?: Factura;
  recibido:boolean
}
export interface Factura{
  id:number;
  numero_factura:string;
  proveedor_id:Proveedor;
  orden_compra_id:OrdenCompra;
  fecha_pago:Date;
  fecha:Date;
  remitos?:Remito;
  importe:number;
}
export interface Presupuesto {
  id: number;
  producto_id: number;
  unidad_medida_id: number;
  proveedor_id: number;
  responsable_id?: number;
  importe: number;
  created_at: Time;
  orden_compra_id?: number | null;
  productos?: Producto;
  proveedores?: Proveedor;
  unidades_medida?: UnidadMedida;
  atrasado?: boolean;
}
