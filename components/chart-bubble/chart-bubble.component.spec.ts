import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ChartBubbleComponent } from './chart-bubble.component';

describe('ChartBubbleComponent', () => {
  let component: ChartBubbleComponent;
  let fixture: ComponentFixture<ChartBubbleComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [ChartBubbleComponent],
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(ChartBubbleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
