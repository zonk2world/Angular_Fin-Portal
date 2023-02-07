import { Injectable } from '@angular/core';
import { Store } from '@app/stores/store';
import { CookieService } from 'ngx-cookie-service';

export interface LatestUpdatesState {
  versionsInTimeframe: string[];
  displayBadge: boolean;
  differences: number;
}

@Injectable()
export class LatestUpdatesStore extends Store<LatestUpdatesState> {
  readonly RISK_LENS_UPDATE = 'RISK_LENS_UPDATE';

  constructor(private cookieService: CookieService) {
    super({ versionsInTimeframe: [], displayBadge: false, differences: 0 });
  }

  setCookie(value: LatestUpdatesState) {
    this.cookieService.set(this.RISK_LENS_UPDATE, JSON.stringify(value), 180);
  }

  getCookie(): LatestUpdatesState {
    return JSON.parse(this.cookieService.get(this.RISK_LENS_UPDATE));
  }

  setStateFromCookie(data) {
    const cookie = this.cookieService.check(this.RISK_LENS_UPDATE);
    const datesWithinTimeframe = data
      .filter(update => update.withinDisplayTimeframe)
      .map(update => update.date);

    // new cookie
    if (!cookie) {
      const setCookieVal: LatestUpdatesState = {
        versionsInTimeframe: datesWithinTimeframe,
        displayBadge: datesWithinTimeframe.length > 0,
        differences: datesWithinTimeframe.length,
      };
      this.setState(setCookieVal);
      this.setCookie(this.state);
    }
    // compare current values with cookie values
    else {
      const cookieVal: LatestUpdatesState = this.getCookie();

      this.setState(cookieVal);

      const { versionsInTimeframe: cookieDatesInTmeFrame } = cookieVal;

      if (
        JSON.stringify(datesWithinTimeframe) !==
        JSON.stringify(cookieDatesInTmeFrame)
      ) {
        const differences = datesWithinTimeframe.filter(
          version => !cookieDatesInTmeFrame.includes(version)
        );

        this.setState({
          versionsInTimeframe: datesWithinTimeframe,
          displayBadge: differences.length > 0,
          differences: differences.length,
        });
        this.setCookie(this.state);
      }
    }
  }

  hideBadge() {
    this.setState({
      ...this.state,
      displayBadge: false,
    });

    this.setCookie(this.state);
  }
}
