import { Injectable, OnDestroy } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
} from '@angular/router';
import { SingleSummaryStore } from '@app/stores/single-summary.store';
import { paths } from '@paths';
import { GlobalStore } from '@app/stores/global.store';
import { untilDestroyed, UntilDestroy } from '@ngneat/until-destroy';

@UntilDestroy()
@Injectable()
export class SingleRouteRefreshGuardService implements CanActivate, OnDestroy {
  shouldRedirect;
  constructor(
    protected router: Router,
    protected singleSummaryStore: SingleSummaryStore,
    protected globalStore: GlobalStore
  ) {
    this.globalStore
      .select(globalState => globalState.redirectOnRefresh)
      .pipe(untilDestroyed(this))
      .subscribe(shouldRedirect => {
        this.shouldRedirect = shouldRedirect;
      });
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    // if (this.shouldRedirect && this.singleSummaryStore.state.firstLoad) {
    //   this.singleSummaryStore.setFirstLoad(false);
    //   this.router.navigateByUrl(paths.singleFundAnalysis);
    //   return false;
    // }
    return true;
  }

  ngOnDestroy(): void {}
}
