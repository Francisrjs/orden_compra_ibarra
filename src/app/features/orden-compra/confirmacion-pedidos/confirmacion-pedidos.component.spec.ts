import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmacionPedidosComponent } from './confirmacion-pedidos.component';

describe('ConfirmacionPedidosComponent', () => {
  let component: ConfirmacionPedidosComponent;
  let fixture: ComponentFixture<ConfirmacionPedidosComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ConfirmacionPedidosComponent]
    });
    fixture = TestBed.createComponent(ConfirmacionPedidosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
