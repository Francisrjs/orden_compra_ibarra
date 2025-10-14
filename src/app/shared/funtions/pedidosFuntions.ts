import { Areas, TiempoItem } from 'src/app/core/models/database.type';

export function getBadgeClassByEstadoPedido(estado: string): string {
  switch (estado) {
    case 'En Creacion':
      return 'text-bg-warning';
    case 'En Proceso de Aprobacion':
      return 'text-bg-info';
    case 'Aprobado':
      return 'text-bg-primary';
    case 'Aprobado Parcialmente':
      return 'text-bg-warning';
    case 'Cerrado':
      return 'text-bg-success';
    case 'Rechazado':
      return 'text-bg-danger';
    case 'En Proceso de Entrega':
      return 'text-bg-info'
    default:
      return 'text-bg-secondary';
  }
}
export function getBadgeClassByPedidoItem(estado: string) {
  switch (estado) {
    case 'Pendiente':
      return 'text-bg-warning';
    case 'Aprobado':
      return 'text-bg-primary';
    case 'Aprobado parcial':
      return 'text-bg-success';
    case 'Rechazado':
      return 'text-bg-danger';
    case 'Aceptado':
      return 'text-bg-success'
    case 'En Envio':
      return 'text-bg-warning'
    default:
      return 'text-bg-secondary';
  }
}
export function getBadgeClassByOC(estado: string) {
  switch (estado) {
    case 'Borrador':
      return 'text-bg-secondary';
    case 'EN PROCESO':
      return 'text-bg-warning';
    case 'CERRADA':
      return 'text-bg-success';
    case 'ABIERTA':
      return 'text-bg-primary';
    case 'CANCELADA':
      return 'text-bg-danger';
    default:
      return 'text-bg-secondary';
  }
}
export function getIconByArea(area: Areas): string {
  switch (area) {
    case 'LOGISTICA':
      return 'bi-truck';
    case 'ADMINISTRACION':
      return 'bi-briefcase';
    case 'OBRAS':
      return 'bi-tools';
    case 'SISTEMAS':
      return 'bi-laptop';
    case 'TALLER':
      return 'bi-gear';
    case 'PREDIO':
      return 'bi-building';
    default:
      return 'bi-question-circle'; // Un ícono por defecto si el área no coincide
  }
}

export function getEstadoTiempo(tiempo_item:TiempoItem){
  switch (tiempo_item){
    case 'DEMORADO':
      return 'danger';
    case 'EN PLAZO':
      return 'success';
    case 'POR VENCER':
      return 'warning';
    default:
      return 'info';
  }
}
