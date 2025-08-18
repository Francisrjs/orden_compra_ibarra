import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InputModalSelectorComponent } from './input-modal-selector.component';

describe('InputModalSelectorComponent', () => {
  let component: InputModalSelectorComponent;
  let fixture: ComponentFixture<InputModalSelectorComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [InputModalSelectorComponent]
    });
    fixture = TestBed.createComponent(InputModalSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
