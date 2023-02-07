import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { CardTableBenchmarkComponent } from './card-table-benchmark.component';

describe('CardTableBenchmarkComponent', () => {
  let component: CardTableBenchmarkComponent;
  let fixture: ComponentFixture<CardTableBenchmarkComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [CardTableBenchmarkComponent],
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(CardTableBenchmarkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
