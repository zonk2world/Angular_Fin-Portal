import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { InputSelectDropdownComponent } from './input-select-dropdown.component';

describe('InputSelectDropdownComponent', () => {
  let component: InputSelectDropdownComponent;
  let fixture: ComponentFixture<InputSelectDropdownComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [InputSelectDropdownComponent],
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(InputSelectDropdownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
