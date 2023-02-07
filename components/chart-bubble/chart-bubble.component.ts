import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
  ViewEncapsulation,
} from '@angular/core';
import { ComparativeSummaryStore } from '@app/stores/comparative-summary.store';
import { PdfStateStore } from '@app/stores/pdf-state.store';
import { UtilityService } from '@services/utility.service';

@Component({
  selector: 'app-chart-bubble',
  templateUrl: './chart-bubble.component.html',
  styleUrls: ['./chart-bubble.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class ChartBubbleComponent implements OnInit, OnChanges {
  @Input() data; // needs to be pre sorted at page level
  @Input() benchData;
  @Input() fundLabel;
  @Input() benchmarkName;
  @Input() chartId;
  @Input() currentFundName;
  benchLabel: string;
  maxSize = 150;
  smallThreshold = this.maxSize / 7;
  currentFund;
  largest;
  ratioFundData;
  ratioBenchData;
  isPrinting: boolean;

  constructor(
    private comparativeSummaryStore: ComparativeSummaryStore,
    private pdfStateStore: PdfStateStore
  ) {}

  ngOnInit() {
    this.isPrinting = this.pdfStateStore.state.isPrinting;
    this.benchLabel = UtilityService.getDynamicBenchLabel(
      this.comparativeSummaryStore.state.benchmarkType
    );
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.currentFundName?.currentValue) {
      this.currentFund = this.data.find(fund => fund.name === changes.currentFundName.currentValue);
      this.setCircleSizes(this.currentFund);
    }
  }

  getRatios(values) {
    // get radius and area of largest circle
    const maxRadius = this.maxSize / 2;
    const area = maxRadius * maxRadius * Math.PI;

    return values.map((val, idx) => {
      const radius = Math.sqrt(((val / this.largest) * area) / Math.PI);
      const diameter = radius * 2;

      return {
        value: val,
        size: diameter,
      };
    });
  }

  setCircleSizes(currentFund) {
    this.largest = currentFund.values
      .concat(this.benchData)
      .reduce((a, b) => Math.max(a, b));

    this.ratioFundData = this.getRatios(currentFund.values);
    this.ratioBenchData = this.getRatios(this.benchData);
  }
}
