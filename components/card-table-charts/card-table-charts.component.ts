import {
  Component,
  OnInit,
  Input,
  ViewEncapsulation,
  ViewChild,
  ElementRef,
  HostListener,
} from '@angular/core';

@Component({
  selector: 'app-card-table-charts',
  templateUrl: './card-table-charts.component.html',
  styleUrls: ['./card-table-charts.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class CardTableChartsComponent implements OnInit {
  @Input() tooltipTourStep = null;
  @Input() cardTitle;
  @Input() range;
  @Input() benchmarkHeader;
  @Input() benchmarkData;
  @Input() tooltip;
  @Input() chartsHeader;
  @Input() chartsData;
  mobileThreshold = 992;

  showPager = false;

  // @Input() header;
  // @Input() data;

  @ViewChild('panel', { static: true }) public panel: ElementRef;

  constructor() {}

  ngOnInit() {
    if (
      this.chartsData.length > 6 ||
      window.innerWidth < this.mobileThreshold
    ) {
      this.showPager = true;
    }
  }

  scrollRight() {
    this.panel.nativeElement.scrollLeft += this.panel.nativeElement.scrollWidth;
  }

  scrollLeft() {
    this.panel.nativeElement.scrollLeft = 0;
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    const width = event.target.innerWidth;
    if (width < this.mobileThreshold) {
      this.showPager = true;
    } else if (width >= this.mobileThreshold) {
      if (this.chartsData.length > 6) {
        this.showPager = true;
      } else {
        this.showPager = false;
      }
    }
  }
}
