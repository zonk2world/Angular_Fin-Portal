import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ChartBarVerticalComponent } from './chart-bar-vertical.component';

describe('ChartBarVerticalComponent', () => {
  let component: ChartBarVerticalComponent;
  let fixture: ComponentFixture<ChartBarVerticalComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [ChartBarVerticalComponent],
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(ChartBarVerticalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
