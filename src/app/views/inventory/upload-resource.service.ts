import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
@Injectable({
	providedIn: 'root'
})
export class UploadResourceService {

	constructor() {}
	public uploadFile(file: File): Observable<any> {
		return of(file);
	}
}
