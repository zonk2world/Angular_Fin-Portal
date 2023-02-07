import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, ActivatedRouteSnapshot } from '@angular/router';

@Component({
  selector: 'app-chart-bar-vertical',
  templateUrl: './chart-bar-vertical.component.html',
  styleUrls: ['./chart-bar-vertical.component.scss'],
})
export class ChartBarVerticalComponent implements OnInit {
  @Input() range;
  @Input() data;
  customColors;
  colorScheme = {
    domain: ['#00A9F4'],
  };
  chartHeight: number;

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.data = Object.keys(this.data).map(fund => {
      return {
        name: fund,
        value: this.data[fund],
      };
    });

    const dataItemHeight = 33;
    const bottomMargin = 16;
    this.chartHeight = this.data.length * dataItemHeight + bottomMargin;

    this.customColors = this.customizeColors();
  }

  customizeColors() {
    return this.data
      .filter(item => item.value < 0)
      .map(match => {
        return {
          name: match.name,
          value: '#8A92A6',
        };
      });
  }

  format(data) {
    return '';
  }
}
