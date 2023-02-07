import {
  AfterViewInit,
  Component,
  Input,
  OnDestroy,
  OnInit,
  Renderer2,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { UtilityService } from '@services/utility.service';
import { SessionStorageService } from '@services/session-storage.service';

@Component({
  selector: 'app-card-table-modal',
  templateUrl: './card-table-modal.component.html',
  styleUrls: ['./card-table-modal.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class CardTableModalComponent
  implements OnInit, OnDestroy, AfterViewInit {
  cardTitle: String;
  @Input() activeState: Boolean;
  tooltip;
  @Input() dataActive;
  @Input() dataAbsolute;
  @Input() fundName;
  @ViewChild('table') table;
  settings = {
    columns: {
      label: {
        title: 'Factor',
        filter: false,
        sort: true,
        class: 'factor',
        compareFunction: this.COMPARE_INSENSITIVE,
      },
      percent: {
        title: '% of total',
        filter: false,
        sort: true,
        sortDirection: 'asc',
        class: 'perc',
        compareFunction: this.COMPARE_INSENSITIVE,
      },
    },
    pager: {
      display: false,
    },
    attr: {
      class: 'card-table-top__table',
    },
    actions: {
      add: false,
      edit: false,
      delete: false,
    },
  };

  constructor(
    public activeModal: NgbActiveModal,
    private sessionService: SessionStorageService,
    private renderer: Renderer2
  ) {}

  ngOnInit() {
    const scrollWidth = this.sessionService.getValue('scrollbar-width');
    this.renderer.setStyle(document.body, 'padding-right', `${scrollWidth}px`);
  }

  ngAfterViewInit() {
    UtilityService.deselectFirstTableRow(this.table);
  }

  ngOnDestroy() {
    this.renderer.setStyle(document.body, 'padding-right', `0`);
  }

  COMPARE_INSENSITIVE(direction: any, a: any, b: any): number {
    let first;
    let second;

    first = a;
    second = b;

    if (
      a.indexOf('%') >= 0 ||
      b.indexOf('%') >= 0 ||
      a.indexOf('$') >= 0 ||
      b.indexOf('$') >= 0
    ) {
      first = typeof a === 'string' ? Number(a.replace(/[^0-9,.,-]/g, '')) : a;
      second = typeof b === 'string' ? Number(b.replace(/[^0-9,.,-]/g, '')) : b;
    } else {
      first = a;
      second = b;
    }

    if (first < second) {
      return direction;
    }
    if (first > second) {
      return -1 * direction;
    }
    return 0;
  }
}
