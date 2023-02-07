import {
  map,
  merge,
  debounceTime,
  switchMap,
  takeUntil,
  tap,
} from 'rxjs/operators';
import {
  Component,
  OnInit,
  Input,
  ViewChild,
  EventEmitter,
  Output,
  Renderer2,
  ElementRef,
  ViewEncapsulation,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { ApiService } from '../../services/api.service';
import { StaticDataService } from '@services/static-data.service';
import { NgbTypeahead } from '@ng-bootstrap/ng-bootstrap';
import { Observable, Subject } from 'rxjs';

import { MessagingService } from '@services/messaging.service';
import { find } from 'lodash';
import { detect } from 'detect-browser';
import { BrowserDetectService } from '@services/browser-detect.service';
import { apiPath } from '@env/apiPath';
import { GlobalStore } from '@app/stores/global.store';

@Component({
  selector: 'app-form-autocomplete',
  templateUrl: './form-autocomplete.component.html',
  styleUrls: ['./form-autocomplete.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class FormAutocompleteComponent implements OnInit, OnChanges {
  public model;
  @Input() items;
  @Input() notFoundEnabled;
  notFoundItem = {
    name: 'NOTFOUND',
    label: 'Fund/ETF not found. Ask for help?',
    benchId: null,
  };
  @ViewChild('instance', { static: true }) instance: NgbTypeahead;
  @ViewChild('input', { static: true }) input: ElementRef;
  @Input() placeholder: string;
  @Input() buttonON;
  @Input() buttonText: string;
  @Input() label: string;
  @Input() useApi = false;
  @Input() storedValue: string;
  @Output() valueChanged = new EventEmitter<string>();
  @Output() addButtonClicked = new EventEmitter<Object>();
  // enterCounter = 0;
  focus$ = new Subject<string>();
  click$ = new Subject<string>();
  htmlId;
  // browserName;

  constructor(
    private apiService: ApiService,
    private staticDataService: StaticDataService,
    private messagingService: MessagingService,
    private renderer: Renderer2,
    private globalStore: GlobalStore,
    private browserDetectService: BrowserDetectService
  ) {}

  ngOnInit() {
    // const browser = detect();
    // this.browserName = this.browserDetectService.browser;

    // Generate unique id for browser compliance.
    this.htmlId = Math.random()
      .toString()
      .substring(2);

    if (this.storedValue) {
      setTimeout(() => {
        this.input.nativeElement.value = this.storedValue.toUpperCase();
      });
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    const { items, storedValue } = changes;

    // Update the model if either items or storedValue has changed.
    if (items || storedValue) {
      this.model = this.storedValue
        ? this.mapNameToObject(this.storedValue, this.items)
        : null;
    }
  }

  /**
   * Returns the search callback from the ngbTypeahead component.
   * (inside function is needed to capture "this")
   *
   * Converts a stream of text values from the <input> element to the stream of
   * the array of items to display in the typeahead popup.
   * If the resulting observable emits a non-empty array - the popup will be
   * shown. If it emits an empty array - the popup will be closed.
   */
  getSearch = (text$: Observable<string>) => {
      const input$ = text$.pipe(debounceTime(200), merge(this.focus$));

      // Fall back to the provided item list if the mock api is used.
      const isMock = this.globalStore.state.currentApiPath === apiPath.mock;

      if (isMock || !this.useApi) {
        return input$.pipe(this.preloadedItemsSearch());
      } else {
        return input$.pipe(this.dynamicSearch(text$));
      }
    };

  /**
   * Handle searching through a list of preloaded terms.
   */
  preloadedItemsSearch() {
    return map((term: string) => {
      if (term === '') {
        return [];
      }

      if (
        this.browserDetectService.browser === 'ie' ||
        this.browserDetectService.browser === 'edge'
      ) {
        // bug with IE - only filter in IE if length > 1
        if (term.length > 1) {
          return this.filterItems(term);
        }
      } else {
        return this.filterItems(term);
      }
    });
  }

  /**
   * Handles searching via the api.
   */
  dynamicSearch(text$) {
    return switchMap(term => {
      if (term === '') {
        return [];
      }

      return this.apiService.getFundAutocomplete(term).pipe(
        map((items: any) => {
          const matches = [];

          if (items && Array.isArray(items.funds)) {
            items.funds.forEach(item => {
              // Api format:
              // {
              //    'benchmark_group': 'MSCI_EM',
              //    'benchmark_id': '891800',
              //    'manager': 'Causeway Capital Management LLC',
              //    'name': 'Causeway Emerging Markets Fund Insti Cl',
              //    'namespace_code': 'FUND:CEMIX',
              //    'ticker': 'CEMIX'
              //  }

              matches.push({
                name: item['ticker'],
                label: item['name'],
                benchId: item['benchmark_id'],
              });
            });
          }

          if (matches.length == 0 && this.notFoundEnabled) {
            matches.push(this.notFoundItem);
          }

          return matches.slice(0, 10);
        }),
        takeUntil(text$)
      );
    });
  }

  /**
   * Filters the available options for a given search term.
   * The search term is checked against .displayTicker (the user-friendly ticker
   * name, e.g. for custom portfolios) first if that exists, and .name
   * (the api-provided ticker) afterward.
   *
   * @param term
   */
  filterItems(term) {
    let items = this.items
      .filter(v => {
        let searchable = v.label;
        if (v.displayTicker) {
          // If displayTicker is present, we only search that (and not .name)
          searchable = v.displayTicker + searchable;
        } else {
          searchable = v.name + searchable;
        }

        return searchable.toUpperCase().indexOf(term.toUpperCase()) > -1;
      })
      .sort((a, b) => {
        const aValue = a.displayTicker ? a.displayTicker : a.name;
        const bValue = b.displayTicker ? b.displayTicker : b.name;

        // Order the ones that matched on the ticker (not just the label) first.
        if (
          aValue.toUpperCase().indexOf(term.toUpperCase()) === 0 &&
          bValue.toUpperCase().indexOf(term.toUpperCase()) === 0
        ) {
          if (aValue < bValue) return -1;
          if (aValue > bValue) return -1;
          return 0;
        } else if (aValue.toUpperCase().indexOf(term.toUpperCase()) === 0) {
          return -1;
        } else if (bValue.toUpperCase().indexOf(term.toUpperCase()) === 0) {
          return 1;
        } else {
          if (aValue < bValue) return -1;
          if (aValue > bValue) return -1;

          return 0;
        }
      })
      .slice(0, 10);

    if (items.length == 0 && this.notFoundEnabled) {
      items.push(this.notFoundItem);
    }

    return items;
  }

  /**
   * Callback to format the selected value in the typeahead element.
   *
   * @param x
   *   Current selection.
   */
  formatter(x: any) {
    return x.displayTicker ? x.displayTicker : x.name;
  }

  /**
   * Called when the selected value changes.
   *
   * whether typed or selected, emits the same object with the following:
   *  name: ticker,
   *  displayTicker: optional user-friendly ticker for display purposes.
   *  label: long description,
   *  benchId: associated bench id string
   */
  onChange() {
    this.emitModel(this.valueChanged);
  }

  /**
   * Looks up the object in "items" that correspond to the given "name" string
   * value. "name" should be the ticker of one of the objects.
   *
   * @param name - b
   * @param items -
   */
  mapNameToObject(name: string, items: any[]) {
    if (!this.items) {
      return null;
    }

    return items
      .filter(item => {
        // Use displayTicker if set, or the api-provided ticker (.name) otherwise.
        let ticker = item.displayTicker ? item.displayTicker : item.name;
        return name.toUpperCase() === ticker;
      })
      .map(item => item)[0];
  }

  emitModel(emitter) {
    if (!this.model['name']) {
      // Assume the value is a string.
      if (this.model.length === 0) {
        emitter.emit(null);
      }

      const match = this.mapNameToObject(this.model, this.items);
      if (match) {
        emitter.emit(match);
        this.model = match;
      }
    } else {
      emitter.emit(this.model);
    }
  }

  /**
   * When Enter button is clicked this will trigger add button clicked flow.
   * works only if the add button is enabled
   */
  public onEnterKeydown(): void {
    if (this.buttonON) {
      this.onAddButtonClicked(this.input.nativeElement);
    }
  }

  /**
   * Called when the selected value changes.
   */
  onAddButtonClicked(input) {
    if (this.model) {
      this.emitModel(this.addButtonClicked);
      setTimeout(() => {
        this.model = null;
        this.renderer.setProperty(input, 'value', null);
      }, 0);
    }
  }

  /**
   * Fires any time the input loses focus:
   * clicking on the dropdown fund name, clicking on the "Add" button,
   * or anywhere else
   */
  onBlur(e) {
    let model;
    if (!this.model) {
      return;
    }

    if (this.model.name) {
      // this.model is an object. Transform the value to the uppercase ticker.
      model = this.model.displayTicker
        ? this.model.displayTicker.toUpperCase()
        : this.model.name.toUpperCase();
    } else {
      model = this.model.toUpperCase();
    }

    // check if input is in available funds
    const match = this.mapNameToObject(model, this.items);

    if (!match) {
      this.model = null;
      this.valueChanged.emit(this.model);
      e.target.value = '';
    }
  }
}
