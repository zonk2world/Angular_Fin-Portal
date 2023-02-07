import { Injectable } from '@angular/core';
import {
  Router,
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
} from '@angular/router';
import { UserInfoService } from '@services/user-info.service';
import { UtilityService } from '@services/utility.service';
import { FeatureFlagServiceService } from '@services/feature-flag-service.service';
import { first, map } from 'rxjs/operators';
import { GlobalStore } from '@app/stores/global.store';

@Injectable()
export class AuthGuardService implements CanActivate {
  constructor(
    public userInfoService: UserInfoService,
    public featureFlagServiceService: FeatureFlagServiceService,
    public utilityService: UtilityService,
    public router: Router,
    public globalStore: GlobalStore
  ) {}

  /**
   * Called before a route is activated. If it returns false, the access is denied.
   * (but we actually redirect here instead of showing an access denied message)
   */
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    if (!this.userInfoService.isAuthenticated()) {
      // The hosting platform is supposed to block access to the app altogether,
      // so this is not supposed to happen, but just in case the user is here
      // without an auth token, block access.
      this.utilityService.openErrorModal(
        'You do not have permission to access this interface.'
      );
      return false;
    }

    // If we have an auth token, and it has expired, redirect to the okta logout
    // page, which will show the login form.
    if (this.userInfoService.isTokenExpired()) {
      // Logout link is based on the user info that we are clearing below,
      // so need to save it beforehand.
      let logoutLink = this.userInfoService.getLogoutLink();
      this.userInfoService.clearUserInfo();

      window.location.href = logoutLink;
      return false;
    }

    // Check if the route is tied to a feature that is disabled.
    if (typeof route.data['featureFlag'] !== 'undefined') {
      return this.featureFlagServiceService
        .getFeatureObservable(route.data['featureFlag'])
        .pipe(
          first(),
          map(status => {
            return status;
          })
        );
    }

    // Check if the route is only allowed on a specific api path
    if (route?.data?.apiPath) {
      return this.globalStore.state.currentApiPath === route.data.apiPath;
    }

    return true;
  }
}
