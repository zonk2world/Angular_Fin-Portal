import { Injectable } from '@angular/core';
import { Store } from '@app/stores/store';
import { apiPath } from '@env/apiPath';
import { environment } from '@env/environment';
import {
  LocalStorageService,
  localStorageKeys,
} from '@services/local-storage.service';
import { GlobalStore } from './global.store';

export interface SingleAnalysisFormConfig {
  benchmark: string;
  benchmarkName: string;
  benchmarkUnderscored: string;
  benchmarkType: 'bmk' | 'CASH' | 'etf';
  date: string;
  fund: string;
  humanDate: string;
  preferredBench: { id: string; name: string };
  tickerText: string;
  analysisFormDate: {
    year: number;
    month: number;
    day: number;
  };
}

export interface SingleSummaryState extends SingleAnalysisFormConfig {
  isActiveState: boolean;
  firstLoad: true;
  volatility: number;
}

let singleFundParams: SingleAnalysisFormConfig = LocalStorageService.getStoredValue(
  localStorageKeys.SINGLE_FUND_ANALYSIS_PARAMS
);

const singleVolatility: number = LocalStorageService.getStoredValue(
  localStorageKeys.SINGLE_VOLATILITY
);

if (!singleFundParams) {
  singleFundParams = {
    benchmark: null,
    benchmarkName: null,
    benchmarkUnderscored: null,
    benchmarkType: null,
    date: null,
    fund: null,
    humanDate: null,
    preferredBench: null,
    tickerText: null,
    analysisFormDate: null,
  };
}

const cashSelected = singleFundParams.benchmark === 'CASH';

const initialState: SingleSummaryState = {
  isActiveState: !cashSelected,
  firstLoad: true,
  volatility: singleVolatility,
  ...singleFundParams,
};

@Injectable()
export class SingleSummaryStore extends Store<SingleSummaryState> {
  constructor(
    private globalStore: GlobalStore
  ) {
    super(initialState);
  }

  setSingleAnalysisParams(params: SingleAnalysisFormConfig) {
    this.setState({
      ...this.state,
      ...params,
    });

    // set to local storage so can be read on print-all
    LocalStorageService.setStoredValue(
      localStorageKeys.SINGLE_FUND_ANALYSIS_PARAMS,
      { ...params }
    );
  }

  resetSingleAnalysisParams() {
    let params = {
      benchmark: null,
      benchmarkName: null,
      benchmarkUnderscored: null,
      benchmarkType: null,
      date: null,
      fund: null,
      humanDate: null,
      preferredBench: null,
      tickerText: null,
      analysisFormDate: null,
    };

    this.setState({
      ...this.state,
      ...params,
    });

    // set to local storage so can be read on print-all
    LocalStorageService.setStoredValue(
      localStorageKeys.SINGLE_FUND_ANALYSIS_PARAMS,
      { ...params }
    );
  }

  setActiveState(val: boolean) {
    this.setState({
      ...this.state,
      isActiveState: val,
    });
  }

  setFirstLoad(val) {
    this.setState({
      ...this.state,
      firstLoad: val,
    });
  }

  setVolatility(value: number) {
    this.setState({
      ...this.state,
      volatility: value,
    });

    LocalStorageService.setStoredValue(
      localStorageKeys.SINGLE_VOLATILITY,
      value
    );
  }

  getSingleAnalysisParams(): SingleAnalysisFormConfig {
    const {
      benchmark,
      benchmarkUnderscored,
      benchmarkName,
      preferredBench,
      humanDate,
      date,
      fund,
      tickerText,
      analysisFormDate,
      benchmarkType,
    } = this.state;

    let currentFund = fund;
    if (
      !environment.production &&
      this.globalStore.state.currentApiPath === apiPath.mock
    ) {
      currentFund = 'CEMIX';
    }

    return {
      benchmark,
      benchmarkName,
      benchmarkUnderscored,
      preferredBench,
      date,
      fund: currentFund,
      humanDate,
      tickerText,
      analysisFormDate,
      benchmarkType,
    };
  }

  benchmarkIsCash(): boolean {
    return this.state.benchmark === 'CASH';
  }
}
