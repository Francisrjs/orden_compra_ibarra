import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrdenCompraDetailComponent } from './orden-compra-detail.component';

describe('OrdenCompraDetailComponent', () => {
  let component: OrdenCompraDetailComponent;
  let fixture: ComponentFixture<OrdenCompraDetailComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [OrdenCompraDetailComponent]
    });
    fixture = TestBed.createComponent(OrdenCompraDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
