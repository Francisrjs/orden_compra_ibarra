export type EstadoPedido =
  | 'En Creacion'
  | 'En Proceso de Aprobacion'
  | 'Aprobado'
  | 'Aprobado Parcialmente'
  | 'Cerrado'
  | 'Rechazado';
export type EstadoItemPedido = 'Pendiente' | 'Aprobado para OC' | 'Rechazado';
export type EstadoOC =
  | 'Borrador'
  | 'Enviada a Proveedor'
  | 'Recibida Parcialmente'
  | 'Recibida Completa'
  | 'Cancelada';

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
  responsable_id: string; // Corresponde al UUID del usuario en Supabase Auth
  urgente: boolean;
  plazo_entrega?: string; // Formato 'YYYY-MM-DD'
  estado: EstadoPedido;
  fecha_creacion: string; // Formato ISO 8601

  //relaciones opcionales
  pedido_items?: PedidoItem[];
}

export interface PedidoItem {
  id: number;
  pedido_id: number;
  producto_id: number;
  cantidad: number;
  estado: EstadoItemPedido;
  justificacion_rechazo?: string;
  razon_pedido: string;
  unidad_medida_id: number;

  unidad_medida: UnidadMedida;
  //Relacion opcional
  producto?: Producto;
}

export interface OrdenCompra {
  id: number;
  numero_oc: string;
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
  orden_compra_id: number;
  pedido_item_id: number;
  precio_unitario?: number;
  cantidad_comprada: number;

  // Opcional: para mostrar datos relacionados
  pedido_items?: PedidoItem;
}
