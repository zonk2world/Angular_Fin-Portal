import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { CardTableMatrixComponent } from './card-table-matrix.component';

describe('CardTableMatrixComponent', () => {
  let component: CardTableMatrixComponent;
  let fixture: ComponentFixture<CardTableMatrixComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [CardTableMatrixComponent],
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(CardTableMatrixComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
