import { Injectable } from '@angular/core';
import { SpreadsheetService } from '@services/spreadsheet.service';
import * as XLSX from '@sheet/chart';
import { WorkBook } from '@sheet/chart';
import {ChartIds} from "@app/models/chart-ids";

type AOA = any[][];

@Injectable({
  providedIn: 'root',
})
export class StyleExposuresSpreadsheetService extends SpreadsheetService {
  benchTableHeader;
  benchTableData;
  verticalCharts;
  styleNames;
  fundNames;
  uploadedFundsAlertMessage;

  /**
   * Loads the report data for xls generation. This method should be called
   * with the appropriate data before the xls export is run.
   */
  loadData(
    funds,
    benchmarkName,
    humanDate,
    benchTableHeader,
    benchTableData,
    verticalCharts,
    styleNames,
    fundNames,
    chartData,
    uploadedFundsAlertMessage
  ) {
    this.funds = funds;
    this.benchmarkName = benchmarkName;
    this.humanDate = humanDate;
    this.benchTableHeader = benchTableHeader;
    this.benchTableData = benchTableData;
    this.verticalCharts = verticalCharts;
    this.styleNames = styleNames;
    this.fundNames = fundNames;
    this.chartData = chartData;
    this.uploadedFundsAlertMessage = uploadedFundsAlertMessage;
  }

  /**
   * @inheritDoc
   */
  async generateDataSheets(wb: WorkBook) {
    const styleExposuresSheet = await this.getStyleExposuresSheet();
    XLSX.utils.book_append_sheet(wb, styleExposuresSheet, 'Style Exposures');
  }

  async getStyleExposuresSheet() {
    let sheet: XLSX.WorkSheet = this.createSheet();

    sheet['!cols'] = [];
    sheet['!rows'] = [];
    sheet['!images'] = [];

    // Page header.
    this.addCell(sheet, 'A2', 'Style Exposures', {
      bold: true,
      color: { rgb: SpreadsheetService.BLUE_TEXT_COLOR },
      sz: 24,
    });
    this.addCell(sheet, 'A3', `Benchmark or Index ETF: ${this.benchmarkName}`, {
      sz: 14,
    });
    this.addCell(sheet, 'A4', `Reference Date: ${this.humanDate}`, { sz: 14 });

    // Chart.
    this.rowIndex = 6;
        
    if(this.uploadedFundsAlertMessage){
      this.addCell(sheet, `A${this.rowIndex}`, `ⓘ ${this.uploadedFundsAlertMessage }`, { fgColor: { rgb: SpreadsheetService.YELLOW_HIGHLIGHT_COLOR } });
      this.addCell(sheet, `B${this.rowIndex}`, null, { fgColor: { rgb: SpreadsheetService.FORM_YELLOW } });
      this.addCell(sheet, `C${this.rowIndex}`, null, { fgColor: { rgb: SpreadsheetService.FORM_YELLOW } });
      this.addCell(sheet, `D${this.rowIndex}`, null, { fgColor: { rgb: SpreadsheetService.FORM_YELLOW } });
      this.addCell(sheet, `E${this.rowIndex}`, null, { fgColor: { rgb: SpreadsheetService.FORM_YELLOW } });
      this.addCell(sheet, `F${this.rowIndex}`, null, { fgColor: { rgb: SpreadsheetService.FORM_YELLOW } });
      this.addCell(sheet, `G${this.rowIndex}`, null, { fgColor: { rgb: SpreadsheetService.FORM_YELLOW } });
      this.addCell(sheet, `H${this.rowIndex}`, null, { fgColor: { rgb: SpreadsheetService.FORM_YELLOW } });
      this.rowIndex++;
    }
    
    this.addChart(sheet, ChartIds.StyleExposuresBarOrHistorical);

    // Active style exposures table (vertical charts)
    await this.addActiveStyleExposuresTable(sheet);

    // Fund style exposures table.
    this.addDynamicTableToSheet(
      sheet,
      'FUND STYLE EXPOSURES',
      this.benchTableHeader,
      this.benchTableData
    );

    // Go back and color the cells in the "index eft" column.
    for (let i = 0; i < this.benchTableData.length; i++) {
      const cell = `B${this.rowIndex - 2 - i}`;
      this.setCellStyles(
        sheet,
        { fgColor: { rgb: SpreadsheetService.YELLOW_HIGHLIGHT_COLOR } },
        [cell]
      );
    }

    // Add color legend for the "index eft" column.
    const benchHeader = this.benchTableHeader.find(
      item => item.id === 'benchmark'
    );
    if (benchHeader) {
      this.addCell(
        sheet,
        `B${this.rowIndex - 3 - this.benchTableData.length}`,
        SpreadsheetService.circleIcon + ' ' + benchHeader.title,
        {
          color: { rgb: SpreadsheetService.YELLOW_HIGHLIGHT_COLOR },
        }
      );
    }

    // Set col width.
    sheet['!cols'][0] = { wpx: 300 };

    sheet['!gridlines'] = false;

    return sheet;
  }

  async addActiveStyleExposuresTable(sheet) {
    const activeExposuresTable: AOA = [];

    // Table title.
    activeExposuresTable.push([['ACTIVE STYLE EXPOSURES']]);

    // Header has 'style', then the fund names.
    const headerRow = [];
    headerRow.push('STYLE');
    this.fundNames.forEach(fund => {
      headerRow.push(fund.title);
      headerRow.push(''); // Placeholder for the chart (note, these cells will be merged)
    });

    activeExposuresTable.push(headerRow);

    // Each style has its own row.
    for (let i = 0; i < this.styleNames.length; i++) {
      const style = this.styleNames[i];
      const styleRow = [];

      styleRow.push(style);

      for (let j = 0; j < this.verticalCharts.length; j++) {
        // Each item in this.verticalCharts is a column corresponding to a fund.
        // Find the value for thisrow in each.
        const fundValue = this.verticalCharts[j][style]
          ? this.verticalCharts[j][style]
          : '';
        styleRow.push(''); // Placeholder for the chart
        styleRow.push(fundValue);
      }

      activeExposuresTable.push(styleRow);

      // Set height must match css so that the image lines up.
      sheet['!rows'][this.rowIndex + 1 + i] = { hpx: 35 };
    }

    XLSX.utils.sheet_add_aoa(sheet, activeExposuresTable, {
      origin: `A${this.rowIndex}`,
    });

    // Set style for title cells.
    sheet[`A${this.rowIndex}`].s = { bold: true, sz: 14 };

    // Set style for header cells.
    for (let col = 0; col < this.fundNames.length * 2 + 1; col++) {
      sheet[`${String.fromCharCode(65 + col)}${this.rowIndex + 1}`].s = {
        bold: true,
        sz: 14,
        fgColor: { rgb: SpreadsheetService.GRAY_BACKGROUND_COLOR },
      };
    }

    await this.addVerticalChartImages(sheet, this.rowIndex + 2);

    // Shift rowIndex by the number of rows + headers + one empty row;
    this.rowIndex = this.rowIndex + this.styleNames.length + 3;
  }

  /**
   * Adds the vertical chart images into the active style exposure table.
   * There is one empty column to hold the vertical chart images next to the
   * column that has the numbers. The image height must match the height of
   * all the data rows combined so that the image lines up with th numbers.
   *
   * @param sheet
   * @param startRow
   *   First data row of the table.
   */
  async addVerticalChartImages(sheet, startRow) {
    const vChartIds = Object.keys(this.chartData).filter(chartId => chartId.indexOf('chart-bar-vertical-') > -1);

    for (var i = 0; i < vChartIds.length; i++) {
      sheet['!images'].push({
        '!pos': {
          c: 1 + 2 * i, // First image is in col B, then every other column.
          r: startRow - 1, // .r is 0-based
          x: 0,
          y: 0,
          w: 80,
          h: 290,
        },
        '!datatype': 'base64',
        '!data': this.chartData[vChartIds[i]].imageData,
      });
    }
  }

  /**
   * @inheritDoc
   */
  getExportedPageTitle() {
    return 'Style Exposures';
  }
}
