import {
  Component,
  Input,
  OnDestroy,
  OnInit,
  ViewEncapsulation,
} from '@angular/core';
import { MessagingService } from '@services/messaging.service';
import { FormControl } from '@angular/forms';
import { INgxSelectOption } from 'ngx-select-ex';

@Component({
  selector: 'app-input-select-dropdown',
  templateUrl: './input-select-dropdown.component.html',
  styleUrls: ['./input-select-dropdown.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class InputSelectDropdownComponent implements OnInit, OnDestroy {
  /**
   * @input items: string - array of values for dropdown
   * @input message: string - broadcasts a message
   * @input messageToReceive: string - optional, sets current value to message.data value
   */

  @Input() items: any[];
  @Input() message: string;
  @Input() messageToReceive: string;
  @Input() labelKey;
  @Input() valueKey;
  selectControl = new FormControl();
  messageSubscription;

  constructor(private messagingService: MessagingService) {}

  ngOnInit() {
    if (this.messageToReceive) {
      this.messageSubscription = this.messagingService.addObserver(message => {
        if (message.messageType === this.messageToReceive) {
          const selected = this.items.filter(item => {
            if (this.valueKey) {
              return item[this.valueKey] === message.data;
            } else {
              return item === message.data;
            }
          });

          // see Reactive Forms - sets current value
          if (selected.length > 0) {
            this.selectControl.setValue(
              this.valueKey ? selected[0][this.valueKey] : selected[0]
            );
          }
        }
      });
    }
  }

  setDefault(): any {
    return this.valueKey ? this.items[0][this.valueKey] : this.items[0];
  }

  handleSelect(value: any) {
    // Send a message when value changes
    if (this.message) {
      this.messagingService.sendMessage(this.message, value);
    }
  }

  ngOnDestroy(): void {
    if (this.messageSubscription) {
      this.messagingService.unsubscribeFromObserver(this.messageSubscription);
    }
  }
}
