import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpInterceptor,
  HttpHandler,
  HttpRequest,
} from '@angular/common/http';
import { UserInfoService } from '@services/user-info.service';
import { Observable } from 'rxjs';
import { UtilityService } from '@services/utility.service';
import { GlobalStore } from '@app/stores/global.store';
import { environment } from '@env/environment';
import { apiPath } from '@env/apiPath';

@Injectable()
export class UserInfoInterceptor implements HttpInterceptor {
  constructor(
    private utilityService: UtilityService,
    private userInfoService: UserInfoService,
    private globalStore: GlobalStore
  ) {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    // If user info is available, add the user header to outgoing requests.
    const userInfo = this.userInfoService.getUserInfo();
    if (userInfo && userInfo.email) {
      this.utilityService.debugLog('Adding user info to request header.');

      const authReq = req.clone({
        headers: req.headers.set('X-Ccm-User', userInfo.email),
      });
      return next.handle(authReq);
    } else {
      return next.handle(req);
    }
  }
}
