import { environment } from '@env/environment';
import { apiPath } from '@env/apiPath';
import { Injectable } from '@angular/core';
import { Store } from '@app/stores/store';
import { SessionStorageService } from '@services/session-storage.service';

export interface GlobalState {
  currentApiPath: string;
  redirectOnRefresh: boolean;
  sidebarExpanded: boolean;
  ccmComparativeFundsCollapsed: boolean;
  ccmComparativeCustomPortfoliosCollapsed: boolean;
}
let baseUrl = apiPath.mock;

if (environment.production) {
  baseUrl = environment.apiBaseUrl;
}

export const initalState: GlobalState = {
  sidebarExpanded: true,
  currentApiPath: JSON.parse(sessionStorage.getItem('ccm-env'))
    ? JSON.parse(sessionStorage.getItem('ccm-env'))
    : baseUrl,
  redirectOnRefresh:
    JSON.parse(sessionStorage.getItem('ccm-refresh-enabled')) !== null
      ? JSON.parse(sessionStorage.getItem('ccm-refresh-enabled'))
      : true,
  ccmComparativeFundsCollapsed: false,
  ccmComparativeCustomPortfoliosCollapsed: false,
};

@Injectable()
export class GlobalStore extends Store<GlobalState> {
  constructor(private sessionStorageService: SessionStorageService) {
    super(initalState);
  }

  toggleEndpoint(env: string) {
    if (env === 'mock') {
      this.sessionStorageService.setValue('ccm-env', apiPath.mock);
    } else {
      this.sessionStorageService.setValue('ccm-env', apiPath.base);
    }

    this.setState({
      ...this.state,
      currentApiPath: this.sessionStorageService.getValue('ccm-env'),
    });
  }

  setApiDomain(endpoint: string) {
    this.sessionStorageService.setValue('ccm-env', endpoint);

    this.setState({
      ...this.state,
      currentApiPath: this.sessionStorageService.getValue('ccm-env'),
    });
  }

  toggleRefresh() {
    this.setState({
      ...this.state,
      redirectOnRefresh: !this.state.redirectOnRefresh,
    });

    this.sessionStorageService.setValue(
      'ccm-refresh-enabled',
      this.state.redirectOnRefresh
    );
  }

  setSidebarExpanded(isExpanded) {
    this.setState({
      ...this.state,
      sidebarExpanded: isExpanded,
    });
  }

  toggleCcmFundsCollapsed() {
    this.setState({
      ...this.state,
      ccmComparativeFundsCollapsed: !this.state.ccmComparativeFundsCollapsed,
    });
  }

  toggleCustomPortfolioCollapsed() {
    this.setState({
      ...this.state,
      ccmComparativeCustomPortfoliosCollapsed: !this.state
        .ccmComparativeCustomPortfoliosCollapsed,
    });
  }
}
