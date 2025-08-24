export function getBadgeClassByEstadoPedido(estado: string): string {
  switch (estado) {
    case 'En Creacion':
      return 'text-bg-secondary';
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
    case 'Aprobado parcialmente':
      return 'text-bg-warning';
    case 'Rechazado':
      return 'text-bg-danger';
    default:
      return 'text-bg-secondary';
  }
}
