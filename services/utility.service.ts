import { Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { DatePipe, DecimalPipe } from '@angular/common';
import { PercentPipe } from '@angular/common';
import { find } from 'lodash';
import { ApiCacheService } from '@services/api-cache.service';
import { MessagingService } from '@services/messaging.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import { SessionStorageService } from '@services/session-storage.service';
import { ComparativeFundConfig } from '@app/stores/comparative-summary.store';
import { SingleAnalysisFormConfig } from '@app/stores/single-summary.store';
import { MessageModalComponent } from '@components/message-modal/message-modal.component';

@Injectable()
export class UtilityService {
  constructor(
    private percentPipe: PercentPipe,
    private datePipe: DatePipe,
    private apiCacheService: ApiCacheService,
    private messagingService: MessagingService,
    private decimalPipe: DecimalPipe,
    private modalService: NgbModal,
    private sessionService: SessionStorageService,
    private router: Router
  ) {}

  static generateTimestamp() {
    const date = new Date();
    const pipe = new DatePipe('en-US');
    const timestamp = pipe.transform(date, 'yyyyMMdd-HHmmss');
    return timestamp;
  }

  /**
   * Formats decimal into percent
   *
   * @param val 0.15
   * @return string 15%
   */
  static ccmPercentFormat(val: any): string {
    const percent = new PercentPipe('en-US');
    return percent.transform(val, '1.2-2');
  }

  /**
   * Formats number to two decimal places
   *
   * @param val 0.15
   * @return string 15%
   */
  static ccmDecimalFormat(val: any): string {
    const decimal = new DecimalPipe('en-US');
    return decimal.transform(val, '1.2-2');
  }

  static dateWithin(ccmDate: string, monthsAgo = 4) {
    const currentDate = UtilityService.ccmDateStringToDateTime(ccmDate);
    const d = new Date();
    d.setMonth(d.getMonth() - monthsAgo);
    return currentDate > d;
  }

  static ccmDateStringToDateTime(data: string) {
    const year = Number(data.substring(0, 4));
    const month = Number(data.substring(4, 6));
    const day = Number(data.substring(6, 8));

    return new Date(year, month - 1, day);
  }

  /**
   * ng2-smart-table bug selects the first row all the time on load
   * @param table
   */
  static deselectFirstTableRow(table) {
    setTimeout(() => {
      if (table.grid.dataSet['rows'][0]) {
        table.grid.dataSet.deselectAll();
        table.grid.dataSet['rows'][0].isSelected = false;
        table.grid.dataSet['selectedRow'] = null;
      }
    });
  }

  static getDynamicBenchLabel(
    benchmarkType: SingleAnalysisFormConfig['benchmarkType'],
    shortName = false
  ): 'Benchmark' | 'Index ETF' | 'CASH' | 'Bench' {
    if (benchmarkType === 'etf') {
      return 'Index ETF';
    } else if (benchmarkType === 'bmk') {
      return shortName ? 'Bench' : 'Benchmark';
    } else {
      return 'CASH';
    }
  }

  /**
   * Returns the top items from a risk/factor report. The returned dataset
   * is suitable as input for card-table-top.
   *
   * @param items
   *   Array of data items, keyed by fund id.
   * @param expProp
   *   The name of the property that should be used for the exposure value.
   *   This value is used for sorting.
   * @param tcarProp
   *   The name of the property that should be used for the tcar value.
   * @param percentProp
   *   The name of the property that should be used for the percentage of total value.
   * @param {number} limit
   *   Maximum number of items to return.
   * @param stockList
   *   set true when generating stock lists to get stock name
   *
   * @returns Array<{
   *   stock;
   *   exp;
   *   tcar;
   *   percent;
   * }>
   */
  getTopRiskItems(
    items: any,
    expProp,
    tcarProp,
    percentProp,
    limit = 5,
    stockList = false
  ) {
    let topItems = [];
    let allItems = [];
    const style = 'STYLE';

    for (const key in items) {
      if (items.hasOwnProperty(key)) {
        // Array key is fund ticker.
        // Values are converted to percentage
        let exp;
        let tcar;
        let percent;
        if (key.indexOf(style) !== -1) {
          exp = this.decimalPipe.transform(items[key][expProp], '1.2-2');
          // tcar = this.decimalPipe.transform(items[key][tcarProp], '1.2-2');
          // percent = this.decimalPipe.transform(items[key][percentProp], '1.2-2');
        } else {
          exp = this.percentPipe.transform(items[key][expProp], '1.2-2');
          // tcar = this.percentPipe.transform(items[key][tcarProp], '1.2-2');
          // percent = this.percentPipe.transform(items[key][percentProp], '1.2-2');
        }

        allItems.push({
          stock: stockList ? items[key]['name'] : key,
          order: Number(items[key][percentProp]),
          exp: exp,
          tcar: this.percentPipe.transform(items[key][tcarProp], '1.2-2'),
          percent: this.percentPipe.transform(items[key][percentProp], '1.2-2'),
        });
      }
    }

    // Sort by the exposure value, largest to smallest.
    allItems.sort((a, b) => b.order - a.order);

    allItems.forEach(item => {
      if (topItems.length == limit) {
        return;
      }

      topItems.push(item);
    });
    return topItems;
  }

  /**
   * Formats current date into yyyyMMdd string
   */
  formatReferenceDate() {
    const date = new Date();
    const pipe = new DatePipe('en-US');
    return pipe.transform(date, 'yyyyMMdd');
  }

  /**
   * Returns various versions of Date object, for use in different components
   * @param: data: string in form of yyyyMMdd
   * Returns an object of formatted dates for analysis forms
   * {
   *   apiDate: 19990101 (yyyyMMdd),
   *   humanDate: January 01 1999 (MMMM d, y),
   *   formDateDate: {
   *      year: num,
   *      month: num,
   *      day: num
   *    }
   * }
   */
  getDefaultDate(data: string) {
    const date = UtilityService.ccmDateStringToDateTime(data);
    const pipe = new DatePipe('en-US');
    let apiDate;
    let humanDate;
    let yearMonthDayDate;
    let formDateDate;

    apiDate = pipe.transform(date, 'yyyyMMdd');
    humanDate = pipe.transform(date, 'MMM d, y');
    yearMonthDayDate = pipe.transform(date, 'y M d').split(' ');
    formDateDate = {
      year: Number(yearMonthDayDate[0]),
      month: Number(yearMonthDayDate[1]),
      day: Number(yearMonthDayDate[2]),
    };

    return {
      apiDate,
      humanDate,
      formDateDate,
    };
  }

  /**
   * Returns an array of fund tickers
   *
   * @param data: object with nested objects
   *
   * @return an object of all available funds
   *  {
   *    [fund name]: [fund description],
   *  }
   */
  processFundNamesResponse(data: object) {
    const names = {};
    const getTickers = obj => {
      if (!obj) {
        return;
      }

      Object.keys(obj).forEach(key => {
        if (typeof obj[key] === 'object') {
          getTickers(obj[key]);
        } else {
          names[key] = obj[key];
        }
      });
    };

    getTickers(data);
    return names;
  }

  /**
   * Returns the color map for the predicted active return correlation matrix.
   *
   * @return
   *   Color mapping, where keys are the ranking value returned from the api,
   *   and value is the corresponding color code.
   */
  getParcColorMap() {
    return {
      20: '#FE4E49',
      19: '#FB6648',
      18: '#F87D46',
      17: '#F69444',
      16: '#F3AA42',
      15: '#F0C140',
      14: '#EED73E',
      13: '#E9EB3D',
      12: '#CFE83B',
      11: '#B4E639',
      10: '#99E338',
      9: '#7FE136',
      8: '#65DE34',
      7: '#4CDB33',
      6: '#33D931',
      5: '#30D645',
      4: '#2ED35B',
      3: '#2CD170',
      2: '#2BCE85',
      1: '#2ACC9A',
    };
  }

  /**
   * Returns scrollbar width
   * @return {number}
   */
  get scrollbarWidth() {
    return window.innerWidth - document.documentElement.clientWidth;
  }

  /**
   * Opens modal with factor data
   * @param: clickedFactor: object, data about clicked chart-pie item
   * @param: chartPieData: object, structured data for generating chart-pie
   * @param: apiFrr: object, frr data for fund
   *
   * @returns: Object to be used with card-table-modal to create table data
   *      {
   *        matchedFactor: object,
   *        dataActive: array of objects,
   *        dataAbsolute: array of objects
   *      }
   */
  generateFactorModalData(
    clickedFactor: Object,
    chartPieData: Object,
    apiFrr: Object
  ) {
    const matchedFactor = find(chartPieData, {
      label: clickedFactor['factorName'],
    });
    const decomp = apiFrr['factor_decomp'];
    const dataActive = [];
    const dataAbsolute = [];

    Object.keys(decomp)
      .filter(factor => decomp[factor].category === matchedFactor['apiId'])
      .map(match => {
        dataActive.push({
          label: match,
          percent: this.percentPipe.transform(
            decomp[match].active_pcr,
            '1.2-2'
          ),
        });

        dataAbsolute.push({
          label: match,
          percent: this.percentPipe.transform(decomp[match].port_pcr, '1.2-2'),
        });
      });

    dataActive.sort((a, b) => {
      return parseFloat(b.percent) / 100.0 - parseFloat(a.percent) / 100.0;
    });
    dataAbsolute.sort((a, b) => {
      return parseFloat(b.percent) / 100.0 - parseFloat(a.percent) / 100.0;
    });

    return {
      matchedFactor,
      dataActive,
      dataAbsolute,
    };
  }

  /**
   * Opens a modal with a success message.
   *
   * @param message: string
   * @param route: path to redirect on close
   * @param callback: function to call when the modal is closed
   */
  openSuccessModal(message: string, route?: string, callback?) {
    this.openErrorModal(message, route, callback, 'success');
  }

  /**
   * Opens a modal with an alert message.
   *
   * @param message: string
   * @param route: path to redirect on close
   * @param callback: function to call when the modal is closed
   * @param type: modal type to show
   */
  openErrorModal(message: string, route?: string, callback?, type?: string) {
    const modalRef = this.modalService.open(MessageModalComponent, {
      backdropClass: 'transparent-bg',
      windowClass: 'transparent-bg',
    });
    modalRef.componentInstance.message = message;
    modalRef.componentInstance.type = type ? type : 'error';

    if (route) {
      modalRef.result.then(
        () => {
          this.router.navigate([route]);
        },
        () => {
          this.router.navigate([route]);
        }
      );
    }

    if (callback) {
      modalRef.result.then(
        () => {
          callback();
        },
        () => {
          callback();
        }
      );
    }
  }

  /**
   * Returns a set of mock fund names for use
   * on non-production environment
   *
   * @return an object that mimics the structure of data collected in
   * the comparative-form-analysis
   */
  getMockFundNames(): ComparativeFundConfig[] {
    if (sessionStorage.errorFund === 'true') {
      // if the error state has been toggled on the comparative
      // analysis form it adds the REEBX fund, which has frr data but
      // no historical data
      return [
        {
          name: 'DFCEX',
          label: 'DFA Emerging Markets Core Equity Portfolio',
        },
        {
          name: 'CEMIX',
          label: 'Causeway Emerging Markets Fund Insti Cl',
        },
        {
          name: 'ARTJX',
          label: 'Artisan International Small Cap Fund - Investor Shares',
        },
        {
          name: 'REEBX',
          label: 'reebx label',
        },
      ];
    }
    return [
      {
        name: 'SGOIX',
        label: 'First Eagle Overseas Fund Class I',
      },
      {
        name: 'ODVYX',
        label: 'Oppenheimer Developing Markets Fund Class Y',
      },
      {
        name: 'LZEMX',
        label: 'Lazard Emerging Markets Equity Portfolio Institutional Shares',
      },
      {
        name: 'DFCEX',
        label: 'DFA Emerging Markets Core Equity Portfolio',
      },
      {
        name: 'CEMIX',
        label: 'Causeway Emerging Markets Fund Insti Cl',
      },
      {
        name: 'ARTJX',
        label: 'Artisan International Small Cap Fund - Investor Shares',
      },
      // {
      //   name: 'HADUX',
      //   label: 'DFA Emerging Markets Core Equity Portfolio',
      // },
    ];
  }

  htmlEncode(str) {
    const htmlEntities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&apos;"
    };
    
    return str.replace(/([&<>"'])/g, match => htmlEntities[match]);
  }

  /**
   * Logs a message to the console in dev mode,
   * and in production mode if debugOnProd is true
   * @param message
   */
  debugLog(message: any, debugOnProd: boolean = false) {
    if (!environment.production || debugOnProd) {
      console.log(message);
    }
  }
}
