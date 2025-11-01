import { Injectable, inject, signal, computed, effect } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

export interface Language {
  readonly code: string;
  readonly name: string;
  readonly flag: string;
  readonly isRtl: boolean;
}

const SUPPORTED_LANGUAGES: Language[] = [
  { code: 'en', name: 'English', flag: '🇺🇸', isRtl: false },
  { code: 'he', name: 'עברית', flag: '🇮🇱', isRtl: true },
  { code: 'ua', name: 'Українська', flag: '🇺🇦', isRtl: false },
  { code: 'ru', name: 'Русский', flag: '🇷🇺', isRtl: false }
];

const DEFAULT_LANGUAGE = 'en';
const STORAGE_KEY = 'language';

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  private translateService = inject(TranslateService);

  // Signals
  readonly currentLanguage = signal<string>(this.getInitialLanguage());
  
  // Computed signals
  readonly currentLanguageData = computed(() => 
    SUPPORTED_LANGUAGES.find(lang => lang.code === this.currentLanguage()) || SUPPORTED_LANGUAGES[0]
  );
  
  readonly isRtl = computed(() => this.currentLanguageData().isRtl);
  readonly supportedLanguages = signal(SUPPORTED_LANGUAGES);

  constructor() {
    // Initialize translation service
    this.translateService.setDefaultLang(DEFAULT_LANGUAGE);
    this.translateService.use(this.currentLanguage());

    // Apply initial direction
    this.updateHtmlDirection(this.isRtl());

    // Effect to update DOM and storage when language changes
    effect(() => {
      const lang = this.currentLanguage();
      const isRtl = this.isRtl();
      
      // Update translation service
      this.translateService.use(lang);
      
      // Update HTML direction
      this.updateHtmlDirection(isRtl);
      
      // Save to storage
      localStorage.setItem(STORAGE_KEY, lang);
    });
  }

  /**
   * Set the current language
   */
  setLanguage(languageCode: string): void {
    const language = SUPPORTED_LANGUAGES.find(lang => lang.code === languageCode);
    if (language) {
      this.currentLanguage.set(languageCode);
    } else {
      console.warn(`Unsupported language: ${languageCode}`);
    }
  }

  /**
   * Get language data by code
   */
  getLanguageByCode(code: string): Language | undefined {
    return SUPPORTED_LANGUAGES.find(lang => lang.code === code);
  }

  /**
   * Check if a language is supported
   */
  isLanguageSupported(code: string): boolean {
    return SUPPORTED_LANGUAGES.some(lang => lang.code === code);
  }

  /**
   * Get initial language from storage or default
   */
  private getInitialLanguage(): string {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && this.isLanguageSupported(saved)) {
      return saved;
    }
    return DEFAULT_LANGUAGE;
  }

  /**
   * Update HTML direction attribute
   */
  private updateHtmlDirection(isRtl: boolean): void {
    const htmlElement = document.documentElement;
    htmlElement.setAttribute('dir', isRtl ? 'rtl' : 'ltr');
  }
}
