import { Component, Input, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { LinkDropdownOption } from '@app/models/link-dropdown';
import { ViewCell } from 'ng2-smart-table';
import { Subject } from 'rxjs';
import { LinkDropdownComponent } from '../link-dropdown/link-dropdown.component';

@Component({
  selector: 'app-link-dropdown-ng2-smart-table-cell',
  templateUrl: '../link-dropdown/link-dropdown.component.html',
  styleUrls: ['../link-dropdown/link-dropdown.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class LinkDropdownNg2SmartTableCellComponent
        extends LinkDropdownComponent
        implements ViewCell, OnInit {

  @Input() value;
  @Input() rowData;
  @Input() idField = 'id';
  // function that determines if link dropdown is disabled with rowData as a param
  @Input() isDisabledFn: (rowData: any) => boolean; 
  // list of functions that correspond with a dropdown option that determine if they are disabled with rowData as a param
  @Input() dropdownOptionDisabledFns: {[optionKey: string]: (rowData: any) => boolean};
  @Output() optionClicked$ = new Subject(); // use a subject since eventEmitters shouldn't be subscribed to

  ngOnInit() {
    // determine if entire dropdown should be disabled
    if (this.isDisabledFn) {
      this.isDisabled = this.isDisabledFn(this.rowData);
    }
    // determine which dropdown options should be disabled
    if (this.dropdownOptionDisabledFns) {
      // create copy of dropdownOptions so we don't change the parent's dropdownOptions var by ref
      this.dropdownOptions = [...this.dropdownOptions.map((option) => ({...option}))]
      // set each option's isDisabled prop based on it's associated function
      Object.keys(this.dropdownOptionDisabledFns).forEach((optionKey) => {
        this.dropdownOptions.find((dropdownOption: LinkDropdownOption) => dropdownOption.text === optionKey).isDisabled
          = this.dropdownOptionDisabledFns[optionKey](this.rowData);
      });
    }
  }

  onOptionClicked(option: string) {
    this.optionClicked$.next({id: this.rowData[this.idField], option: option});
  }
}
