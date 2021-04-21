import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, count, map } from 'rxjs/operators';
import { DateWisedata } from '../models/date-wise-data';
import { GlobalDataSummary } from '../models/global-data';

@Injectable({
  providedIn: 'root',
})
export class DataServiceService {
  constructor(private http: HttpClient) {
    let now = new Date();
    this.month = now.getMonth();
    this.date = now.getDate();
    this.year = now.getFullYear();

    // console.log({
    //   date: this.date,
    //   month: this.month,
    //   year: this.year,
    // });

    this.globalDataUrl = `${this.baseDataUrl}${this.getDate(this.month)}-${
      this.date
    }-${this.year}${this.extension}`;
    // console.log(this.globalDataUrl);
  }

  private baseDataUrl =
    'https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_daily_reports/';
  private globalDataUrl = '';
  private extension = '.csv';
  month;
  year;
  date;

  getDate(date: number) {
    if (date < 10) {
      return '0' + date;
    }
    return date;
  }

  private dateWiseDataUrl =
    'https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_confirmed_global.csv';

  getGlobalData() {
    return this.http.get(this.globalDataUrl, { responseType: 'text' }).pipe(
      map((result) => {
        let raw = {};
        let rows = result.split('\n');
        rows.splice(0, 1);

        rows.forEach((row) => {
          let cols = row.split(/,(?=\S)/);

          let cs = {
            country: cols[3],
            confirmed: +cols[7],
            deaths: +cols[8],
            recovered: +cols[9],
            active: +cols[10],
          };

          let temp: GlobalDataSummary = raw[cs.country];
          if (temp) {
            temp.active = cs.active + temp.active;
            temp.confirmed = cs.confirmed + cs.confirmed;
            temp.deaths = cs.deaths + cs.deaths;
            temp.recovered = cs.recovered + cs.recovered;
            raw[cs.country] = cs;
          } else {
            raw[cs.country] = cs;
          }
        });

        return <GlobalDataSummary[]>Object.values(raw);
      }),
      catchError((error: HttpErrorResponse) => {
        if (error.status == 404) {
          // this.date = this.date - 1;
          let now = new Date();
          now.setDate(now.getDate() - 1);
          this.month = now.getMonth();
          this.date = now.getDate();
          this.year = now.getFullYear();
          this.globalDataUrl = `${this.baseDataUrl}${this.getDate(
            this.month
          )}-${this.date}-${this.year}${this.extension}`;
          // console.log(this.globalDataUrl);
          return this.getGlobalData();
        }
      })
    );
  }

  getDateWiseData() {
    return this.http.get(this.dateWiseDataUrl, { responseType: 'text' }).pipe(
      map((result) => {
        let rows = result.split('\n');
        let header = rows[0];
        let dates = header.split(/,(?=\S)/);
        let mainData = [];
        dates.splice(0, 4);
        rows.splice(0, 1);
        rows.forEach((row) => {
          let cols = row.split(/,(?=\S)/);
          let con = cols[1];
          cols.splice(0, 4);
          mainData[con] = [];
          cols.forEach((value, index) => {
            let dw: DateWisedata = {
              cases: +value,
              country: con,
              date: new Date(Date.parse(dates[index])),
            };
            mainData[con].push(dw);
          });
        });

        return mainData;
      })
    );
  }
}
