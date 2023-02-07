import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  Router,
  RouterStateSnapshot,
} from '@angular/router';
import { ComparativeSummaryStore } from '@app/stores/comparative-summary.store';
import { paths } from '@paths';
import { GlobalStore } from '@app/stores/global.store';
import { SingleRouteRefreshGuardService } from '@app/guards/single-route-refresh-guard.service';
import { SingleSummaryStore } from '@app/stores/single-summary.store';

@Injectable()
export class ComparativeRouteRefreshGuardService extends SingleRouteRefreshGuardService {
  constructor(
    singleSummaryStore: SingleSummaryStore,
    router: Router,
    globalStore: GlobalStore,
    private comparativeSummaryStore: ComparativeSummaryStore
  ) {
    super(router, singleSummaryStore, globalStore);
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    if (this.shouldRedirect && this.comparativeSummaryStore.state.firstLoad) {
      this.comparativeSummaryStore.setFirstLoad(false);
      this.router.navigateByUrl(paths.comparativeFundAnalysis);
      return false;
    }
    return true;
  }
}
