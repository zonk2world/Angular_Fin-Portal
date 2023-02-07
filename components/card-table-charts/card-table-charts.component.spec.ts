import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { CardTableChartsComponent } from './card-table-charts.component';

describe('CardTableChartsComponent', () => {
  let component: CardTableChartsComponent;
  let fixture: ComponentFixture<CardTableChartsComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [CardTableChartsComponent],
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(CardTableChartsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
