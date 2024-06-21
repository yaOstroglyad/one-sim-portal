import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export abstract class DataService<T> {
	protected constructor(protected http: HttpClient, protected baseUrl: string) {}

	create(item: T): Observable<T> {
		return this.http.post<T>(this.baseUrl, item);
	}

	get(id: number): Observable<T> {
		return this.http.get<T>(`${this.baseUrl}/${id}`);
	}

	list(queryParams?: any): Observable<T[]> {
		return this.http.get<T[]>(this.baseUrl, { params: queryParams });
	}

	update(id: number, item: T): Observable<T> {
		return this.http.put<T>(`${this.baseUrl}/${id}`, item);
	}

	updateField(id: number, fieldName: keyof T, value: any): Observable<T> {
		return this.http.patch<T>(`${this.baseUrl}/${id}`, { [fieldName]: value });
	}

	delete(id: number): Observable<void> {
		return this.http.delete<void>(`${this.baseUrl}/${id}`);
	}

}
