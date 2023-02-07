import {
  Component,
  OnInit,
  Input,
  ViewEncapsulation,
  ViewChild,
  ElementRef,
  HostListener,
  OnDestroy,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import {
  ComparativeSummaryState,
  ComparativeSummaryStore,
} from '@app/stores/comparative-summary.store';
import { UtilityService } from '@services/utility.service';
import { untilDestroyed, UntilDestroy } from '@ngneat/until-destroy';
import { SingleSummaryState, SingleSummaryStore } from '@app/stores/single-summary.store';
import { TableSimpleComponent } from '../table-simple/table-simple.component';
import { TableSortConfig } from '@app/models/ng2-smart-table/table-sort-config';

@UntilDestroy()
@Component({
  selector: 'app-card-table-benchmark',
  templateUrl: './card-table-benchmark.component.html',
  styleUrls: ['./card-table-benchmark.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class CardTableBenchmarkComponent
  implements OnInit, OnChanges, OnDestroy {
  @Input() tooltipStep: string = null;
  @Input() cardTitle;
  @Input() headerBenchmark;
  @Input() dataBenchmark;
  @Input() header;
  @Input() dataActive;
  @Input() sort;
  @Input() sortColumnId: string;
  @Input() sortColumnDirection: string;
  @Input() dataAbsolute;
  @Input() firstColWidth;
  @Input() tooltip;
  @Input() tooltipPlacement: 'top' | 'bottom' = 'top';
  @Input() activeState = true;
  @Input() isSingleAnalysis: boolean;
  dynamicBenchLabel: string;
  mobileThreshold = 992;
  showPager = false;
  messageSubscription;

  @ViewChild('panel', { static: true }) public panel: ElementRef;
  @ViewChild(TableSimpleComponent) tableSimpleComponent: TableSimpleComponent; 

  constructor(
    private comparativeSummaryStore: ComparativeSummaryStore,
    private singleSummaryStore: SingleSummaryStore
  ) {}

  ngOnInit() {
    this.showPagerIfEnoughItemsOrSmallScreen();

    // Listen for active state
    if (this.sort === undefined) {
      this.sort = false;
    }

    if (this.firstColWidth === undefined) {
      this.firstColWidth = 100;
    }

    if (!this.sortColumnId) {
      this.sortColumnId = 'benchmark';
    }

    if (!this.sortColumnDirection) {
      this.sortColumnDirection = 'asc'
    }

    this.comparativeSummaryStore
      .select((state: ComparativeSummaryState) => state.benchmarkType)
      .pipe(untilDestroyed(this))
      .subscribe(type => {
        if (!this.isSingleAnalysis) {
          this.dynamicBenchLabel = UtilityService.getDynamicBenchLabel(type);
        }
      });

    this.singleSummaryStore
      .select((state: SingleSummaryState) => state.benchmarkType)
      .pipe(untilDestroyed(this))
      .subscribe(type => {
        if (this.isSingleAnalysis) {
          this.dynamicBenchLabel = UtilityService.getDynamicBenchLabel(type);
        }
      });
  }

  ngOnChanges(changes: SimpleChanges): void {
    const { activeState, dataActive } = changes;

    if (activeState) {
      this.activeState = activeState.currentValue;
    }

    if (dataActive && dataActive.currentValue[0]) {
      this.showPagerIfEnoughItemsOrSmallScreen();
    }
  }

  getSortState(): TableSortConfig {
    return this.tableSimpleComponent?.getSortState();
  }

  /**
   * Shows the scroll buttons if applicable
   *
   * Show the page when there are 9 or more columns,
   * excluding the first 2 columns (label col and benchmark col),
   * so the pager arrows should display when there are 7 fund columns
   */
  showPagerIfEnoughItemsOrSmallScreen(): void {
    if (
      Object.keys(this.dataActive[0]).length > 8 ||
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
      if (Object.keys(this.dataActive[0]).length > 8) {
        this.showPager = true;
      } else {
        this.showPager = false;
      }
    }
  }

  ngOnDestroy(): void {}
}
