import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { count, map } from 'rxjs/operators';
import { DateWisedata } from '../models/date-wise-data';
import { GlobalDataSummary } from '../models/global-data';

@Injectable({
  providedIn: 'root',
})
export class DataServiceService {
  constructor(private http: HttpClient) {}

  private globalDataUrl =
    'https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_daily_reports/04-16-2021.csv';

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
