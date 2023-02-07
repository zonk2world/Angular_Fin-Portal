import { DecimalPipe } from '@angular/common';
import {
  Component,
  OnInit,
  Input,
  ViewEncapsulation,
  SimpleChanges,
  OnChanges,
  Output,
  EventEmitter,
} from '@angular/core';
import { MessagingService } from '@services/messaging.service';

interface Columns {
  [key: string]: any;
}

let columns: Columns = {};

interface IColumn {
  title: string;
}

class Column implements IColumn {
  title: string;
  filter: boolean;
  sort: boolean;
  type: string;
  valuePrepareFunction: any;

  constructor(
    title: string,
    sort: boolean,
    sortAsNumbers,
    valueSuffix = '',
    htmlInside = true
  ) {
    this.title = title;
    this.filter = false;
    this.type = 'html';
    this.sort = sort;

    if (htmlInside) {
      this.valuePrepareFunction = data => {
        return (
          '<div class="matrix_td color_' +
          data.color +
          '">' +
          data.value +
          '</div>'
        );
      };
    } else if (valueSuffix !== '') {
      this.valuePrepareFunction = data => {
        if (data !== '') {
          return data + valueSuffix;
        } else {
          return data;
        }
      };
    }
  }
}

@Component({
  selector: 'app-card-table-matrix',
  templateUrl: './card-table-matrix.component.html',
  styleUrls: ['./card-table-matrix.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class CardTableMatrixComponent implements OnInit, OnChanges {
  @Input() tooltipTourStep: string = null;
  @Input() matrixTourStep: string = null;
  @Input() matrixData;
  @Input() colorMatrix = true;
  @Input() cardTitle;
  @Input() cardTitleExtended;
  @Input() tooltip;
  @Input() tooltipPosition = 'top';
  @Input() valueSuffix = '';
  @Input() toggleEnabled;
  @Input() activeToggle;
  @Output() epochToggled: EventEmitter<number> = new EventEmitter();

  settings = {
    columns: {},
    pager: {
      display: false,
    },
    attr: {
      class: 'card-table-top__table',
    },
    actions: {
      add: false,
      edit: false,
      delete: false,
    },
  };

  source = [];

  constructor(
    private decimalPipe: DecimalPipe,
    private messagingService: MessagingService
  ) {}

  ngOnInit() {
    if (this.toggleEnabled && !this.activeToggle) {
      this.activeToggle = 36;
    } else {
      this.handleToggle(this.activeToggle);
    }

    if (this.toggleEnabled) {
      this.cardTitle = `Realized Active Correlation - Last ${this.activeToggle} months`;
    }

    // Add First Empty column that will hold the Table header in the first column
    columns = {
      0: {
        title: '',
        filter: false,
        type: 'html',
        sort: false,
        valuePrepareFunction: data => {
          return (
            '<div class="matrix_td color_' +
            data.color +
            '">' +
            data.value +
            '</div>'
          );
        },
      },
    };

    this.generateSource();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.matrixData) {
      if (!changes.matrixData.firstChange) {
        this.source = [];
        this.generateSource();
        if (this.toggleEnabled) {
          this.cardTitle = `Realized Active Correlation - Last ${this.activeToggle} months`;
        }
      }
    }
  }

  handleToggle(val) {
    this.activeToggle = val;
    this.epochToggled.emit(val);
  }

  generateSource() {
    // -------------------------------------- Headers
    // Format Columns from Matrix type input

    // Creat column objects out of the row from matrix data
    for (let key in this.matrixData) {
      let value = this.matrixData[key];

      // Create Column Objects
      if (this.colorMatrix) {
        var column = new Column(key, false, false, this.valueSuffix, true);
      } else {
        var column = new Column(key, false, false, this.valueSuffix, false);
      }
      var id = key;

      // Add Column object to Columns with column Key
      columns[id] = column;
    }

    // Update Settings with our new columns
    this.settings.columns = columns;
    this.settings = Object.assign({}, this.settings);

    for (let key in this.matrixData) {
      // Store the key we are working on to delete everything after it in the row
      // to delete everything above the first axis
      let masterKey = key;

      // Initialize the row as empty
      let sourceRow = {};

      // Get the matrixData value
      let value = this.matrixData[key];

      // Clean data above the first axis - START

      // Init erase as false
      let erase = false;
      // Loop through the row data
      for (let innerKey in value) {
        // value.color = value.color.replace(/#/g,"");

        // If we hit the column that is also the row
        // set delete to true
        if (innerKey == masterKey) {
          erase = true;
        }

        // Check if We are displaying a Color Matrix or normal Matrix
        // If it's a color Matrix the Elements should be Objects(value,color) not just values
        if (this.colorMatrix) {
          if (value[innerKey].value === null) {
            value[innerKey] = { color: '', value: '' };
          } else {
            // Clean the color value so we can insert it as a class
            value[innerKey].color = value[innerKey].color.replace(/#/g, '');

            // 2 decimal places
            // value[innerKey].value = Number((value[innerKey].value).toFixed(2));
            value[innerKey].value = this.decimalPipe.transform(
              value[innerKey].value,
              '1.2-2'
            );
          }

          // If erase is true set values to empty
          if (erase) {
            value[innerKey] = { color: '', value: '' };
          }
        } else {
          if (value[innerKey] === null) {
            value[innerKey] = '';
          } else {
            // 2 decimal places
            if (typeof value[innerKey] === 'object') {
            } else if (typeof value[innerKey] === 'string') {
            } else {
              value[innerKey] = this.decimalPipe.transform(
                value[innerKey],
                '1.2-2'
              );
            }
          }

          if (erase) {
            value[innerKey] = '';
          }
        }
      }
      // Clean data - END

      // Make the cleaned value the sourceRow
      sourceRow = value;

      // Add the first column Data to it
      // which is the Current Key (basically the header)
      sourceRow[0] = {
        value: key,
        color: '',
      };

      // Add sourceRow to source
      this.source.push(sourceRow);
    }
  }
}
