import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TableNgItemPedidoComponent } from './table-ng-item-pedido.component';

describe('TableNgItemPedidoComponent', () => {
  let component: TableNgItemPedidoComponent;
  let fixture: ComponentFixture<TableNgItemPedidoComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TableNgItemPedidoComponent]
    });
    fixture = TestBed.createComponent(TableNgItemPedidoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
