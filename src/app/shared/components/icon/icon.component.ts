import { Component, ChangeDetectionStrategy, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { SafeHtml } from '@angular/platform-browser';
import { IconService } from './icon.service';

@Component({
  selector: 'app-icon',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (iconContent$ | async; as iconSvg) {
      <div class="icon-wrapper" [innerHTML]="iconSvg"></div>
    }
  `,
  styles: [`
    :host {
      display: contents;
    }
    
    .icon-wrapper {
      display: contents;
    }
    
    :host ::ng-deep svg {
      width: 100%;
      height: 100%;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IconComponent {
  private readonly iconService = inject(IconService);
  
  iconContent$?: Observable<SafeHtml>;
  
  private _icon?: string;
  private _folder?: string;
  
  @Input() 
  set icon(value: string | undefined) {
    this._icon = value;
    this.loadIcon();
  }
  
  @Input() 
  set folder(value: string | undefined) {
    this._folder = value;
    this.loadIcon();
  }
  
  private loadIcon(): void {
    if (this._icon !== undefined) {
      this.iconContent$ = this.iconService.getIcon(this._icon, this._folder);
    }
  }
}