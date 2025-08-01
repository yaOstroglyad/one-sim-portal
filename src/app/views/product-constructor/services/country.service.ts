import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Country } from '../models';

@Injectable({
  providedIn: 'root'
})
export class CountryService {
  private readonly baseUrl = '/api-product/api/v1/esim-product/countries';

  constructor(private http: HttpClient) {}

  getCountries(): Observable<Country[]> {
    return this.http.get<Country[]>(this.baseUrl);
  }
}