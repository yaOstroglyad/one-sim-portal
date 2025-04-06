import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
	providedIn: 'root'
})
export class LanguageService {
	private currentLang = new BehaviorSubject<string>('en');
	currentLang$ = this.currentLang.asObservable();

	constructor(private translate: TranslateService) {
		const savedLang = localStorage.getItem('language') || 'en';
		this.translate.setDefaultLang('en');
		this.translate.use(savedLang);
		this.currentLang.next(savedLang);
		this.updateHtmlDir(savedLang);
	}

	setLanguage(lang: string) {
		localStorage.setItem('language', lang);
		this.translate.use(lang);
		this.currentLang.next(lang);
		this.updateHtmlDir(lang);
	}

	private updateHtmlDir(lang: string): void {
		const htmlTag = document.documentElement;
		htmlTag.setAttribute('dir', lang === 'he' ? 'rtl' : 'ltr');
	}
}
