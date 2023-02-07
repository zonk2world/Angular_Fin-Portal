import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { CardTableModalComponent } from './card-table-modal.component';

describe('CardTableModalComponent', () => {
  let component: CardTableModalComponent;
  let fixture: ComponentFixture<CardTableModalComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [CardTableModalComponent],
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(CardTableModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
