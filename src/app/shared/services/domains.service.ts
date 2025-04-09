import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { SelectOption } from '../model/field-config';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class DomainsService {
  constructor() { }

  getAvailableDomains(): Observable<SelectOption[]> {
    // Предположим, что API возвращает массив строк доменов
    const mockDomains = ['domain1.com', 'domain2.com', 'domain3.com', 'domain4.com'];
    
    // Преобразуем массив строк в массив SelectOption
    return of(mockDomains).pipe(
      map(domains => domains.map(domain => ({
        value: domain,
        displayValue: domain
      })))
    );
  }
} 