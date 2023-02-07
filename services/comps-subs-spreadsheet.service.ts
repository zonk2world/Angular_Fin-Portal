import { Injectable } from "@angular/core";
import { SpreadsheetService } from "./spreadsheet.service";
import * as XLSX from '@sheet/chart';
type AOA = any[][];
import { WorkBook } from '@sheet/chart';

@Injectable({
  providedIn: 'root'
})
export class CompsSubsSpreadsheetService extends SpreadsheetService {
  fund;
  benchmarkName;
  humanDate;
  tickerText;
  complements;
  substitutes;

  loadData(
    fund,
    benchmarkName,
    humanDate,
    tickerText,
    complements,
    substitutes
  ) {
    this.fund = fund;
    this.benchmarkName = benchmarkName;
    this.humanDate = humanDate;
    this.tickerText = tickerText;
    this.complements = complements;
    this.substitutes = substitutes;
  }

  /**
   * @inheritDoc
   */
  getExportedPageTitle() {
    return 'Complements and Substitutes';
  }

  /**
   * Generates the comps and subs sheet.
   */
  getCompsSubsSheet() {
    let complements = this.complements;
    let substitutes = this.substitutes;

    // Order comps in ascending order.
    complements = Object.keys(complements)
      .sort((a, b) => {
        return (
          parseFloat(complements[a].parc) - parseFloat(complements[b].parc)
        );
      })
      .map(key => {
        return {
          fund: key,
          parc: complements[key].parc,
          name: complements[key].name,
        };
      });

    // Order comps in descending order.
    substitutes = Object.keys(substitutes)
      .sort((a, b) => {
        return (
          parseFloat(substitutes[b].parc) - parseFloat(substitutes[a].parc)
        );
      })
      .map(key => {
        return {
          fund: key,
          parc: substitutes[key].parc,
          name: substitutes[key].name,
        };
      });

    let rows = [];

    // Assume comps and subs have the same number of rows, merge pairs into a row.
    complements.forEach((item, index) => {
      rows.push([
        item.fund,
        this.decimalPipe.transform(item.parc, '1.2-2'),
        '',
        substitutes[index] ? substitutes[index].fund : '',
        substitutes[index]
          ? this.decimalPipe.transform(substitutes[index].parc, '1.2-2')
          : '',
      ]);

      rows.push([
        item.name,
        '',
        '',
        substitutes[index] ? substitutes[index].name : '',
        '',
      ]);

      // Space between funds.
      rows.push([]);
    });

    const tablesHeader: AOA = [
      ...this.getSheetHeader('Complements and Substitutes'),
      ['Top Complementary Funds', '', '', 'Top Substitute Funds', ''],
      [
        'Fund',
        'Predicted Active Return Correlation',
        '',
        'Fund',
        'Predicted Active Return Correlation',
      ],
      [''],
    ];

    const sheet: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(tablesHeader);

    XLSX.utils.sheet_add_aoa(sheet, rows, {
      origin: tablesHeader.length,
    });

    if (!sheet['!cols']) {
      sheet['!cols'] = [];
    }

    if (!sheet['!rows']) {
      sheet['!rows'] = [];
    }

    // Make tickets bold.
    Object.keys(sheet).forEach(key => {
      var matches = key.match(/([A-Z]+)(\d+)/i);
      if (!matches) {
        return;
      }
      var row = parseInt(matches[2]);

      // Every third row after row 10 in col A and D are tickers.
      if (['A', 'D'].indexOf(matches[1]) > -1 && row > 10 && row % 3 == 2) {
        sheet[key].s = { bold: true };
      }
    });

    sheet['!cols'][0] = { wpx: 250 }; // Comp fund name
    sheet['!cols'][1] = { wpx: 250 }; // Comp number
    sheet['!cols'][2] = { wpx: 50 }; // Spacer col
    sheet['!cols'][3] = { wpx: 250 }; // Sub fund name
    sheet['!cols'][4] = { wpx: 250 }; // Sub number

    sheet['A9'].s = {
      bold: true,
      fgColor: { rgb: SpreadsheetService.GRAY_BACKGROUND_COLOR },
    }; // Comp fund name
    sheet['B9'].s = {
      bold: true,
      fgColor: { rgb: SpreadsheetService.GRAY_BACKGROUND_COLOR },
    }; // Comp number
    sheet['D9'].s = {
      bold: true,
      fgColor: { rgb: SpreadsheetService.GRAY_BACKGROUND_COLOR },
    }; // Sub fund name
    sheet['E9'].s = {
      bold: true,
      fgColor: { rgb: SpreadsheetService.GRAY_BACKGROUND_COLOR },
    }; // Sub number

    // Merge the "Top Comp/Subs Funds" cells above the two table header cells.
    sheet['!merges'] = [
      { s: { c: 0, r: 7 }, e: { c: 1, r: 7 } }, // A8-B8
      { s: { c: 3, r: 7 }, e: { c: 4, r: 7 } }, // D8-E8
    ];

    // Center data values.
    const dataCells = Object.keys(sheet).filter(prop => {
      var matches = prop.match(/([A-Z]+)(\d+)/i);
      if (!matches) {
        return false;
      }
      // B, E columns in rows starting with 10 contain the numbers.
      return ['B', 'E'].indexOf(matches[1]) > -1 && parseInt(matches[2]) >= 10;
    });
    this.setCellStyles(
      sheet,
      { alignment: { horizontal: 'center' } },
      dataCells
    );

    // Center align, format "Top Comp/Subs Funds".
    this.setCellStyles(
      sheet,
      {
        bold: true,
        sz: 14,
        fgColor: { rgb: SpreadsheetService.GRAY_BACKGROUND_COLOR },
        alignment: { horizontal: 'center' },
      },
      ['A6', 'D6']
    );

    // Header cells.
    this.formatSheetHeader(sheet, 5);

    sheet['!gridlines'] = false;

    return sheet;
  }

  /**
   * @inheritDoc
   */
  async generateDataSheets(wb: WorkBook) {
    if (this.substitutes && this.complements) {
      const compsSubsSheet = this.getCompsSubsSheet();
      XLSX.utils.book_append_sheet(
        wb,
        compsSubsSheet,
        'Complements and Substitutes'
      );
    }
  }
}