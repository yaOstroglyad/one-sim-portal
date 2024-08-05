import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class LanguageService {
	public $currentLanguage = new BehaviorSubject<string>('en');

	setLanguage(language: string) {
		this.$currentLanguage.next(language);
	}
}
