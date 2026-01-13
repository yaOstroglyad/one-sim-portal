/**
 * Customer Search Adapter
 *
 * Searches customers using CustomersDataService.
 * Maps customer API response to GenericSearchEntity.
 */

import { Injectable, inject } from '@angular/core';
import { Observable, of, catchError, map, timeout } from 'rxjs';

import { Customer, SEARCH_CONFIG } from '@models';
import { CustomersDataService } from '@shared/services/data/customers-data.service';
import {
  EntitySearchAdapter,
  GenericSearchEntity,
  ENTITY_TYPES,
} from '@shared/services/search';

@Injectable({ providedIn: 'root' })
export class CustomerSearchAdapter implements EntitySearchAdapter {
  readonly name = 'customer-adapter';
  readonly entityType = ENTITY_TYPES.CUSTOMER;
  readonly priority = 10;

  private readonly customersDataService = inject(CustomersDataService);

  isEnabled(): boolean {
    return true;
  }

  search(query: string, limit: number): Observable<GenericSearchEntity[]> {
    return this.customersDataService
      .paginatedCustomers({ name: query }, 0, limit)
      .pipe(
        timeout(SEARCH_CONFIG.BACKEND_TIMEOUT_MS),
        map(response => this.mapToGenericEntities(response.content)),
        catchError(error => {
          console.warn('[CustomerSearchAdapter] Search failed:', error);
          return of([]);
        })
      );
  }

  private mapToGenericEntities(customers: Customer[]): GenericSearchEntity[] {
    return customers.map(customer => this.mapCustomer(customer));
  }

  private mapCustomer(customer: Customer): GenericSearchEntity {
    return {
      id: customer.id,
      name: customer.name,
      description: customer.description ?? undefined,
      entityType: ENTITY_TYPES.CUSTOMER,
      routePath: `/home/customers/customer-details/${customer.type}/${customer.id}`,
      parentName: customer.company?.name,
      metadata: {
        type: customer.type,
        companyId: customer.company?.id,
        tags: customer.tags,
      },
    };
  }
}
