import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrdenCompraHomeComponent } from './orden-compra-home.component';

describe('OrdenCompraHomeComponent', () => {
  let component: OrdenCompraHomeComponent;
  let fixture: ComponentFixture<OrdenCompraHomeComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [OrdenCompraHomeComponent]
    });
    fixture = TestBed.createComponent(OrdenCompraHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
