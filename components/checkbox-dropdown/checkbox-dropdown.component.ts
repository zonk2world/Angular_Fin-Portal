import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';

export interface CheckboxDropdownOptionsWithSectionName {
  sectionName?: string;
  options: {
    name: string;
    value: number; // The historically most recent value for this option, used for sorting.
    value_by_avg?: number;  // The average over time value for this option, used for sorting.
  }[];
}

// Ported from CCMPMP for CCM-435 and restyled to match forms
@Component({
  selector: 'app-checkbox-dropdown',
  templateUrl: './checkbox-dropdown.component.html',
  styleUrls: ['./checkbox-dropdown.component.scss'],
})
export class CheckboxDropdownComponent implements OnInit, OnChanges {
  @Input() checkboxOptions: CheckboxDropdownOptionsWithSectionName[];
  @Input() title;
  @Input() checkboxValues: { [x: string]: boolean } = {};
  @Input() id;
  @Input() maximumSelections: number;
  @Output() selectedOptionsEmitter = new EventEmitter<string[]>();
  disableUncheckedOptions: boolean;

  ngOnInit(): void {
    this.id = `${this.id}checkboxDropdown`;
  }

  ngOnChanges(changes: SimpleChanges) {
    const { checkboxValues } = changes;
    if (checkboxValues && checkboxValues.currentValue) {
      const selectedOptions = this.getSelectedOptions(
        checkboxValues.currentValue
      );
      this.disableUncheckedOptions = !!this.maximumSelections && selectedOptions.length >= this.maximumSelections;
    }
  }

  /**
   * Add the default checked values to the selected options
   * so that handleCheckboxToggle updates correctly
   * @param checkboxValues
   */
  getSelectedOptions(checkboxValues): string[] {
    return checkboxValues
      ? Object.keys(checkboxValues).filter(key => this.checkboxValues[key])
      : [];
  }

  /**
   * If item is checked, add to end of array, otherwise remove it
   * Then emit array of selected options
   * @param $event
   */
  handleCheckboxToggle($event) {
    this.checkboxValues[$event.target.value] = $event.target.checked;

    const selectedOptions = this.getSelectedOptions(this.checkboxValues);
    this.disableUncheckedOptions = !!this.maximumSelections && selectedOptions.length >= this.maximumSelections;

    this.selectedOptionsEmitter.emit(selectedOptions);
  }
}
