import { Injectable } from '@angular/core';
import { Store } from '@app/stores/store';
import {
  LocalStorageService,
  localStorageKeys,
} from '@services/local-storage.service';
import {
  CustomPortfolio,
  CustomPortfolioItem,
} from '@app/stores/custom-portfolios.store';

export interface SavedReportsState {
  reports: SavedReport[];
}

/**
 * Represents a saved report.
 */
export class SavedReport {
  id: number;
  name: string;
  benchmark: string;
  date: string;
  funds: string[];
  isComparative: boolean;
  lastModified: Date;

  constructor(data) {
    Object.assign(this, data);
  }
}

let savedReports: SavedReport[] = LocalStorageService.getStoredValue(
  localStorageKeys.SAVED_REPORTS
);

const initialState: SavedReportsState = {
  reports: savedReports ? savedReports : [],
};

@Injectable()
export class SavedReportsStore extends Store<SavedReportsState> {
  constructor() {
    super(initialState);
  }

  addReport(report: SavedReport) {
    let list = this.getReports();
    list.push(report);
    this.setReports(list);
  }

  setReports(reports: SavedReport[]) {
    reports = reports.sort((a, b) => (new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime()));
    this.setState({
      ...this.state,
      reports: reports,
    });

    this.saveState();
  }

  /**
   * Finds the next available id.
   */
  getNextId() {
    let id = 1;
    this.state.reports.forEach(item => {
      if (item.id >= id) {
        id = item.id + 1;
      }
    });

    return id;
  }

  /**
   * Saves the state to the browser storage.
   * (needs to be called manually if the objects are directly updated)
   */
  saveState() {
    LocalStorageService.setStoredValue(
      localStorageKeys.SAVED_REPORTS,
      this.state.reports
    );
  }

  deleteSavedReport(id: number): void {
    let reports = this.getReports().filter(r => r.id !== id);
    this.setReports(reports);
  }

  getReports(): SavedReport[] {
    return this.state.reports;
  }

  /**
   * Finds a report based on the id.
   *
   * @param id
   */
  getReportById(id) {
    let r = this.state.reports.find(item => item.id === parseInt(id));
    return r ? r : null;
  }

  /**
   * Loads saved reports from the API.
   *
   * @param data
   */
  loadApiData(data) {
    let reports: SavedReport[] = [];

    // Format:
    // {
    //   "definition": {
    //     "benchmark_id": "string",
    //     "date": "20201231",
    //     "funds": [
    //     "string"
    //    ]
    //   }
    // }

    data.forEach(reportData => {
      if (!reportData['definition']) {
        return;
      }

      let r = new SavedReport({
        id: parseInt(reportData['saved_report_id']),
        name: reportData['name'],
        benchmark: reportData['definition']['benchmark_id'],
        date: reportData['definition']['date'],
        funds: [],
        lastModified: reportData['updated_datetime']
      });

      if (
        reportData['definition']['funds'] &&
        reportData['definition']['funds'].length
      ) {
        reportData['definition']['funds'].forEach(fundName => {
          r.funds.push(fundName);
        });
      }

      r.isComparative = r.funds.length > 1;

      reports.push(r);
    });

    this.setReports(reports);
  }
}
