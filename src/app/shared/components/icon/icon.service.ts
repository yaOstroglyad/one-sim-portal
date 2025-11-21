import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, catchError, map, shareReplay } from 'rxjs';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Injectable({
  providedIn: 'root'
})
export class IconService {
  private readonly http = inject(HttpClient);
  private readonly sanitizer = inject(DomSanitizer);

  // Cache for loaded icons
  private readonly iconCache = new Map<string, Observable<SafeHtml>>();

  // Default SVG icon
  private readonly DEFAULT_SVG = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none"/></svg>';

  /**
   * Load icon SVG content by name and folder
   * @param iconName - Name of the icon file (without .svg) or full URL
   * @param folder - Optional subfolder in /assets/icons/
   */
  getIcon(iconName: string | undefined, folder?: string): Observable<SafeHtml> {
    const normalizedName = iconName || 'default';
    const cacheKey = this.generateCacheKey(normalizedName, folder);

    // Return from cache if available
    const cached = this.iconCache.get(cacheKey);
    if (cached) {
      return cached;
    }

    // Create new observable and cache it
    const icon$ = this.loadIcon(normalizedName, folder).pipe(
      shareReplay(1)
    );

    this.iconCache.set(cacheKey, icon$);
    return icon$;
  }

  /**
   * Clear icon cache
   */
  clearCache(): void {
    this.iconCache.clear();
  }

  // ================ Private Methods ================

  /**
   * Load icon from URL or local path
   */
  private loadIcon(iconName: string, folder?: string): Observable<SafeHtml> {
    const iconUrl = this.resolveIconUrl(iconName, folder);
    const isExternal = this.isExternalUrl(iconName);

    return this.http.get(iconUrl, { responseType: 'text' }).pipe(
      map(svgContent => this.processSvgContent(svgContent)),
      map(processedSvg => this.sanitizer.bypassSecurityTrustHtml(processedSvg)),
      catchError(() => this.handleLoadError(iconName, folder, isExternal))
    );
  }

  /**
   * Handle icon load errors with fallback logic
   */
  private handleLoadError(
    iconName: string,
    folder: string | undefined,
    isExternal: boolean
  ): Observable<SafeHtml> {
    // External URLs fallback immediately to default
    if (isExternal) {
      return this.createFallbackIcon();
    }

    // Try folder default, then root default
    if (folder) {
      return this.loadFolderDefault(folder);
    }

    return this.loadRootDefault();
  }

  /**
   * Load default icon from specific folder
   */
  private loadFolderDefault(folder: string): Observable<SafeHtml> {
    const url = `/assets/icons/${folder}/default.svg`;

    return this.http.get(url, { responseType: 'text' }).pipe(
      map(svgContent => this.processSvgContent(svgContent)),
      map(processedSvg => this.sanitizer.bypassSecurityTrustHtml(processedSvg)),
      catchError(() => this.loadRootDefault())
    );
  }

  /**
   * Load default icon from root icons folder
   */
  private loadRootDefault(): Observable<SafeHtml> {
    return this.http.get('/assets/icons/default.svg', { responseType: 'text' }).pipe(
      map(svgContent => this.processSvgContent(svgContent)),
      map(processedSvg => this.sanitizer.bypassSecurityTrustHtml(processedSvg)),
      catchError(() => this.createFallbackIcon())
    );
  }

  /**
   * Create inline fallback icon
   */
  private createFallbackIcon(): Observable<SafeHtml> {
    return of(this.sanitizer.bypassSecurityTrustHtml(this.DEFAULT_SVG));
  }

  /**
   * Generate cache key for icon
   */
  private generateCacheKey(iconName: string, folder?: string): string {
    if (this.isExternalUrl(iconName)) {
      return iconName;
    }

    return folder ? `${folder}/${iconName}` : iconName;
  }

  /**
   * Resolve full URL for icon
   */
  private resolveIconUrl(iconName: string, folder?: string): string {
    if (this.isExternalUrl(iconName)) {
      return iconName;
    }

    const path = folder ? `${folder}/${iconName}` : iconName;
    return `/assets/icons/${path}.svg`;
  }

  /**
   * Check if the provided string is an external URL
   */
  private isExternalUrl(value: string): boolean {
    return value.startsWith('http://') ||
           value.startsWith('https://') ||
           value.startsWith('//');
  }

  /**
   * Process SVG content to ensure proper sizing and styling
   */
  private processSvgContent(svgContent: string): string {
    let processed = svgContent;

    // Ensure viewBox exists for proper scaling
    if (!processed.includes('viewBox=')) {
      // If no viewBox, add a default one
      processed = processed.replace('<svg', '<svg viewBox="0 0 24 24"');
    }

    // Add styling class
    if (!processed.includes('class=')) {
      processed = processed.replace('<svg', '<svg class="app-icon"');
    }

    return processed;
  }
}
