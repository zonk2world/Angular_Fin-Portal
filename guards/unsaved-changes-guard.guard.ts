import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  UrlTree,
  CanDeactivate
} from '@angular/router';
import { Observable } from 'rxjs';
import {CustomPortfoliosComponent} from "@pages/custom-portfolios/custom-portfolios.component";
import {ConfirmationModalComponent} from "@components/confirmation-modal/confirmation-modal.component";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {SavedReportSettingsComponent} from "@pages/saved-report-settings/saved-report-settings.component";
import {MessagingService} from "@services/messaging.service";

@Injectable({
  providedIn: 'root'
})
export class UnsavedChangesGuardGuard implements CanDeactivate<CustomPortfoliosComponent>, CanDeactivate<SavedReportSettingsComponent> {

  constructor(public modalService: NgbModal,
              private messagingService: MessagingService) {}

  canDeactivate(component: CustomPortfoliosComponent | SavedReportSettingsComponent, currentRoute: ActivatedRouteSnapshot, currentState: RouterStateSnapshot, nextState?: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    if (component.hasUnsavedChanges()) {
      return this.showUnsavedChangesModal();
    }
    else {
      return true;
    }
  }

  /**
   * Shows the unsaved changes question modal.
   *
   * @return
   *   Promise that resolves with true, if the user clicked "Proceed", or
   *   false otherwise.
   */
  showUnsavedChangesModal(): Promise<boolean> {
    const modalRef = this.modalService.open(ConfirmationModalComponent);
    modalRef.componentInstance.title = 'You Have Unsaved Changes';
    modalRef.componentInstance.okLabel = 'Proceed';
    modalRef.componentInstance.middleLabel = 'Save';
    modalRef.componentInstance.cancelLabel = 'Cancel';
    modalRef.componentInstance.message = 'Would you like to navigate away from this page without saving your changes?';

    return modalRef.result.then(
      result => {
        if (result === true) {
          return true;
        }

        if (result === 'Save') {
          this.messagingService.sendMessage('save-unsaved-changes');
        }

        // Cancel or "Save" button clicked. Prevent navigation.
        return false;
      },
      () => {
        // Dismissed.

        return false;
      }
    );
  }

}
