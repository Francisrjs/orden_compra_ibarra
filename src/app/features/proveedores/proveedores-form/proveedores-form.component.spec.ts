import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProveedoresFormComponent } from './proveedores-form.component';

describe('ProveedoresFormComponent', () => {
  let component: ProveedoresFormComponent;
  let fixture: ComponentFixture<ProveedoresFormComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ProveedoresFormComponent]
    });
    fixture = TestBed.createComponent(ProveedoresFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
