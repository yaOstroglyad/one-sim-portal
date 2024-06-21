import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class LanguageService {
	private currentLanguage = new BehaviorSubject<string>('en');

	setLanguage(language: string) {
		this.currentLanguage.next(language);
	}

	getLanguage() {
		return this.currentLanguage.asObservable();
	}
}
