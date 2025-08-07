import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { MatIconModule } from '@angular/material/icon';

export interface PaginationConfig {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems?: number;
  showPageSizeSelector?: boolean;
  pageSizeOptions?: number[];
  showFirstLast?: boolean;
  showPageNumbers?: boolean;
  maxPageNumbers?: number;
}

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule, TranslateModule, MatIconModule],
  templateUrl: './pagination.component.html',
  styleUrls: ['./pagination.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PaginationComponent {
  @Input() config: PaginationConfig = {
    currentPage: 0,
    totalPages: 1,
    pageSize: 10,
    showPageSizeSelector: false,
    pageSizeOptions: [10, 25, 50, 100],
    showFirstLast: true,
    showPageNumbers: false,
    maxPageNumbers: 5
  };
  
  @Output() pageChange = new EventEmitter<number>();
  @Output() pageSizeChange = new EventEmitter<number>();
  
  get currentPage(): number {
    return this.config.currentPage;
  }
  
  get totalPages(): number {
    return this.config.totalPages;
  }
  
  get isFirstPage(): boolean {
    return this.currentPage === 0;
  }
  
  get isLastPage(): boolean {
    return this.currentPage >= this.totalPages - 1;
  }
  
  get displayPageNumbers(): number[] {
    if (!this.config.showPageNumbers) return [];
    
    const maxPages = this.config.maxPageNumbers || 5;
    const current = this.currentPage;
    const total = this.totalPages;
    
    if (total <= maxPages) {
      return Array.from({ length: total }, (_, i) => i);
    }
    
    const half = Math.floor(maxPages / 2);
    let start = Math.max(0, current - half);
    let end = Math.min(total - 1, start + maxPages - 1);
    
    if (end - start < maxPages - 1) {
      start = Math.max(0, end - maxPages + 1);
    }
    
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }
  
  get showStartEllipsis(): boolean {
    return this.config.showPageNumbers && this.displayPageNumbers[0] > 0;
  }
  
  get showEndEllipsis(): boolean {
    if (!this.config.showPageNumbers) return false;
    const pages = this.displayPageNumbers;
    return pages.length > 0 && pages[pages.length - 1] < this.totalPages - 1;
  }
  
  get startRecord(): number {
    if (!this.config.totalItems) return 0;
    return this.currentPage * this.config.pageSize + 1;
  }
  
  get endRecord(): number {
    if (!this.config.totalItems) return 0;
    const end = (this.currentPage + 1) * this.config.pageSize;
    return Math.min(end, this.config.totalItems);
  }
  
  get isRtl(): boolean {
    return document.documentElement.dir === 'rtl' || 
           document.documentElement.getAttribute('dir') === 'rtl' ||
           getComputedStyle(document.documentElement).direction === 'rtl';
  }
  
  get navigationIcons() {
    if (this.isRtl) {
      // В RTL стрелки должны быть инвертированы
      return {
        first: 'last_page',
        previous: 'chevron_right', 
        next: 'chevron_left',
        last: 'first_page'
      };
    } else {
      // Обычные LTR стрелки
      return {
        first: 'first_page',
        previous: 'chevron_left',
        next: 'chevron_right', 
        last: 'last_page'
      };
    }
  }
  
  onPageChange(page: number): void {
    if (page < 0 || page >= this.totalPages) return;
    if (page === this.currentPage) return;
    
    this.pageChange.emit(page);
  }
  
  onPageSizeChange(size: number): void {
    this.pageSizeChange.emit(size);
  }
  
  onSelectChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.onPageSizeChange(+target.value);
  }
  
  goToFirst(): void {
    this.onPageChange(0);
  }
  
  goToLast(): void {
    this.onPageChange(this.totalPages - 1);
  }
  
  goToPrevious(): void {
    this.onPageChange(this.currentPage - 1);
  }
  
  goToNext(): void {
    this.onPageChange(this.currentPage + 1);
  }
}