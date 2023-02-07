import { filter } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { NavigationEnd, Router, RouterEvent } from '@angular/router';
import { environment } from '@env/environment';

@Injectable()
export class MessagingService {
  private observers: Array<Subscription> = [];
  private subject = new Subject<any>();

  constructor(
    // using MessagingService in UtilityService, removing here
    // to avoid circular dependencies
    // private utilityService: UtilityService
    private router: Router
  ) {
    // Observes added in components may stick around after the component is
    // unloaded. Remove those on route change to prevent memory leak.
    this.router.events
      .pipe(
        filter(
          (event: RouterEvent): event is NavigationEnd =>
            event instanceof NavigationEnd
        )
      )
      .subscribe(event => this.clearObservers());
  }

  /**
   * Adds an observer to receive messages.
   *
   * @param {(message: any) => void} callback
   * @param saveMessageStateAcrossRoutes
   *    If true, message/data is not cleared on route change events.
   *    Defaults to true
   */
  addObserver(
    callback: (message: any) => void,
    saveMessageStateAcrossRoutes: boolean = false
  ) {
    const observer: Subscription = this.subject.subscribe(callback);

    if (!saveMessageStateAcrossRoutes) {
      this.observers.push(observer);
    }
    return observer;
  }

  /**
   * Clears all observers.
   */
  clearObservers() {
    this.observers.forEach(observer => {
      observer.unsubscribe();
    });
    this.observers = [];
  }

  /**
   * Unsubscribe observer from subject
   * @param observer
   */
  unsubscribeFromObserver(observer: Subscription) {
    const index = this.observers.indexOf(observer);
    if (index > -1) {
      this.observers.splice(index, 1);
      observer.unsubscribe();
    }
  }

  /**
   * Sends a message to all current observers.
   *
   * @param {string} messageType
   *   Specifies the message type being sent. Observers can check message.messageType
   *   and react to the message type they are interested in.
   * @param data
   *   Any data to pass along with the message. May depend on the message type.
   */
  sendMessage(messageType: string, data: any = null) {
    const message = { messageType: messageType, data: data };

    if (!environment.production) {
      console.log('Sending message', message);
    }

    this.subject.next(message);
  }
}

export const messages = {
  SINGLE_FUND_ANALYSIS_STAGE_ONE: 'single-fund-analysis-stage-one',
  SINGLE_FUND_ANALYSIS_STAGE_TWO: 'single-fund-analysis-stage-two',
  FUND_SCREENER_HAS_RESULTS: 'fund-screener-has-results',
  CHART_PIE_ITEM_CLICK: 'chart-pie-item-clicked',
  TOGGLE_ACTIVE_ABSOLUTE: 'TOGGLE_ACTIVE_ABSOLUTE',
  BAR_FILTER_BENCHMARK_CHANGE: 'BAR_FILTER_BENCHMARK_CHANGE',
  STORE_PDF_PAGE_STATE: 'store-pdf-page-state',
  PDF_PAGE_STATE_STORED: 'pdf-page-state-stored',
  UPDATE_PDF_LOADING_MESSAGE: 'update-pdf-loading-message',
  UPDATE_PDF_COMPLETION_PERCENTAGE: 'update-pdf-completion-percentage',
  UPDATE_XLS_LOADING_MESSAGE: 'update-xls-loading-message',
  UPDATE_XLS_COMPLETION_PERCENTAGE: 'update-xls-completion-percentage',
  MARKET_CAP_FUND_CHANGED : 'market-cap-fund-changed-main'
};
