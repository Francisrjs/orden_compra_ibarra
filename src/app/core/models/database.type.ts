import { Time } from '@angular/common';

export type EstadoPedido =
  | 'En Creacion'
  | 'En Proceso de Aprobacion'
  | 'En Proceso de Entrega'
  | 'Cerrado'
  | 'Rechazado';
export type EstadoItemPedido =
  | 'Pendiente'
  | 'Aprobado'
  | 'Rechazado'
  | 'Aprobado parcial'
  | 'En Envio';
export type EstadoOC =
  | 'Borrador'
  | 'Enviada a Proveedor'
  | 'Recibida Parcialmente'
  | 'Recibida Completa'
  | 'Cancelada';
export type Areas =
  | 'LOGISTICA'
  | 'ADMINISTRACION'
  | 'OBRAS'
  | 'SISTEMAS'
  | 'TALLER'
  | 'PREDIO';

export type TiempoItem =
  |'EN PLAZO'
  |'POR VENCER'
  |'DEMORADO'


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
  jefe_compra_id: string; // UUID del usuario
  proveedor_id?: number;
  estado: EstadoOC;
  fecha_creacion: string;
  notas?: string;

  // Opcional: para mostrar datos relacionados
  proveedores?: Proveedor;
}

export interface OrdenCompraItem {
  id: number;
  orden_compra_id?: number;
  pedido_item_id?: number;
  precio_unitario?: number;
  cantidad:number;
  subtotal:number;
  // Opcional: para mostrar datos relacionados
  pedido_items?: PedidoItem;
}

export interface Presupuesto {
  id: number;
  producto_id: number;
  unidad_medida_id: number;
  proveedor_id: number;
  responsable_id?: number;
  importe: number;
  created_at: Time;
  orden_compra_id?:number | null;
  productos?: Producto;
  proveedores?:Proveedor;
  unidades_medida?:UnidadMedida;
}
