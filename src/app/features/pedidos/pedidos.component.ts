import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { TableBootstrapComponent } from 'src/app/shared/tables/table-bootstrap/table-bootstrap.component';
import { PedidoService } from './services/pedido.service';

@Component({
  selector: 'app-pedidos',
  templateUrl: './pedidos.component.html',
  styleUrls: ['./pedidos.component.css'],
})
export class PedidosComponent {
  private _pedidoService = inject(PedidoService);
  pedidos() {
    console.log(this._pedidoService.getAllPedidos());
  }

  title = 'Angular';
  value = '500';
  tableColumns = [
    { key: 'name', title: 'Nombre', width: '20%' },
    { key: 'position', title: 'Posición', width: '25%' },
    { key: 'office', title: 'Oficina', width: '15%' },
    { key: 'age', title: 'Edad', width: '10%' },
    { key: 'startDate', title: 'Fecha Inicio', width: '15%' },
    { key: 'salary', title: 'Salario', width: '15%' },
  ];

  tableData = [
    {
      name: 'John Doe',
      email: 'john.doe@gmail.com',
      position: 'Software engineer',
      department: 'IT department',
      status: 'Active',
      level: 'Senior',
      avatar: 'https://mdbootstrap.com/img/new/avatars/8.jpg',
    },
    {
      name: 'Alex Ray',
      email: 'alex.ray@gmail.com',
      position: 'Consultant',
      department: 'Finance',
      status: 'Onboarding',
      level: 'Junior',
      avatar: 'https://mdbootstrap.com/img/new/avatars/6.jpg',
    },
    {
      name: 'Kate Hunington',
      email: 'kate.hunington@gmail.com',
      position: 'Designer',
      department: 'UI/UX',
      status: 'Awaiting',
      level: 'Senior',
      avatar: 'https://mdbootstrap.com/img/new/avatars/7.jpg',
    },
    {
      name: 'Michael Jordan',
      email: 'michael.jordan@example.com',
      position: 'Product Manager',
      department: 'Product',
      status: 'Active',
      level: 'Senior',
      avatar: 'https://mdbootstrap.com/img/new/avatars/1.jpg',
    },
    {
      name: 'Emma Watson',
      email: 'emma.watson@example.com',
      position: 'Frontend Developer',
      department: 'Engineering',
      status: 'Active',
      level: 'Mid-level',
      avatar: 'https://mdbootstrap.com/img/new/avatars/2.jpg',
    },
    {
      name: 'Robert Johnson',
      email: 'robert.johnson@example.com',
      position: 'Backend Developer',
      department: 'Engineering',
      status: 'Onboarding',
      level: 'Junior',
      avatar: 'https://mdbootstrap.com/img/new/avatars/3.jpg',
    },
    {
      name: 'Sophia Martinez',
      email: 'sophia.martinez@example.com',
      position: 'UX Designer',
      department: 'Design',
      status: 'Awaiting',
      level: 'Mid-level',
      avatar: 'https://mdbootstrap.com/img/new/avatars/4.jpg',
    },
    {
      name: 'William Brown',
      email: 'william.brown@example.com',
      position: 'DevOps Engineer',
      department: 'Operations',
      status: 'Active',
      level: 'Senior',
      avatar: 'https://mdbootstrap.com/img/new/avatars/5.jpg',
    },
  ];
}
