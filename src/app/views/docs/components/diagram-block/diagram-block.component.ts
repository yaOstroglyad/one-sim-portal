import {
  Component,
  ChangeDetectionStrategy,
  input,
  signal,
  inject,
  effect,
  HostListener,
  OnDestroy,
} from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import mermaid from 'mermaid';

// Initialize mermaid once
let mermaidInitialized = false;

function initMermaid(): void {
  if (mermaidInitialized) return;

  mermaid.initialize({
    startOnLoad: false,
    theme: 'dark',
    securityLevel: 'loose',
    fontFamily: '"Fira Code", "Monaco", "Consolas", monospace',
  });

  mermaidInitialized = true;
}

// Unique ID counter for mermaid diagrams
let diagramIdCounter = 0;

/**
 * Diagram block component for rendering Mermaid diagrams
 * Similar to code-block but uses mermaid.render() for SVG output
 * Supports fullscreen view with zoom controls
 */
@Component({
  selector: 'os-diagram-block',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="diagram-block">
      @if (error()) {
        <div class="diagram-block__error">
          <span class="diagram-block__error-icon">!</span>
          <span class="diagram-block__error-text">{{ error() }}</span>
        </div>
        <pre class="diagram-block__source"><code>{{ code() }}</code></pre>
      } @else if (renderedDiagram()) {
        <div class="diagram-block__header">
          <span class="diagram-block__label">Diagram</span>
          <button
            class="diagram-block__expand"
            (click)="openFullscreen()"
            title="Open fullscreen (click diagram or press F)">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
              <path fill-rule="evenodd" d="M15 3.75a.75.75 0 01.75-.75h4.5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0V5.56l-3.97 3.97a.75.75 0 11-1.06-1.06l3.97-3.97h-2.69a.75.75 0 01-.75-.75zm-12 0A.75.75 0 013.75 3h4.5a.75.75 0 010 1.5H5.56l3.97 3.97a.75.75 0 01-1.06 1.06L4.5 5.56v2.69a.75.75 0 01-1.5 0v-4.5zm11.47 11.78a.75.75 0 111.06-1.06l3.97 3.97v-2.69a.75.75 0 011.5 0v4.5a.75.75 0 01-.75.75h-4.5a.75.75 0 010-1.5h2.69l-3.97-3.97zm-4.94-1.06a.75.75 0 010 1.06L5.56 19.5h2.69a.75.75 0 010 1.5h-4.5a.75.75 0 01-.75-.75v-4.5a.75.75 0 011.5 0v2.69l3.97-3.97a.75.75 0 011.06 0z" clip-rule="evenodd" />
            </svg>
            <span>Fullscreen</span>
          </button>
        </div>
        <div
          class="diagram-block__container"
          [innerHTML]="renderedDiagram()"
          (click)="openFullscreen()">
        </div>
      } @else {
        <div class="diagram-block__loading">Rendering diagram...</div>
      }
    </div>

    <!-- Fullscreen overlay -->
    @if (isFullscreen()) {
      <div class="diagram-fullscreen" (click)="onOverlayClick($event)">
        <div class="diagram-fullscreen__toolbar">
          <div class="diagram-fullscreen__zoom-controls">
            <button
              class="diagram-fullscreen__btn"
              (click)="zoomOut()"
              [disabled]="zoom() <= 0.25"
              title="Zoom out (-)">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                <path fill-rule="evenodd" d="M3.75 12a.75.75 0 01.75-.75h15a.75.75 0 010 1.5h-15a.75.75 0 01-.75-.75z" clip-rule="evenodd" />
              </svg>
            </button>
            <span class="diagram-fullscreen__zoom-level">{{ Math.round(zoom() * 100) }}%</span>
            <button
              class="diagram-fullscreen__btn"
              (click)="zoomIn()"
              [disabled]="zoom() >= 3"
              title="Zoom in (+)">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                <path fill-rule="evenodd" d="M12 3.75a.75.75 0 01.75.75v6.75h6.75a.75.75 0 010 1.5h-6.75v6.75a.75.75 0 01-1.5 0v-6.75H4.5a.75.75 0 010-1.5h6.75V4.5a.75.75 0 01.75-.75z" clip-rule="evenodd" />
              </svg>
            </button>
            <button
              class="diagram-fullscreen__btn"
              (click)="resetZoom()"
              title="Reset zoom (0)">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                <path fill-rule="evenodd" d="M4.755 10.059a7.5 7.5 0 0112.548-3.364l1.903 1.903h-3.183a.75.75 0 100 1.5h4.992a.75.75 0 00.75-.75V4.356a.75.75 0 00-1.5 0v3.18l-1.9-1.9A9 9 0 003.306 9.67a.75.75 0 101.45.388zm15.408 3.352a.75.75 0 00-.919.53 7.5 7.5 0 01-12.548 3.364l-1.902-1.903h3.183a.75.75 0 000-1.5H2.984a.75.75 0 00-.75.75v4.992a.75.75 0 001.5 0v-3.18l1.9 1.9a9 9 0 0015.059-4.035.75.75 0 00-.53-.918z" clip-rule="evenodd" />
              </svg>
            </button>
          </div>
          <button
            class="diagram-fullscreen__btn diagram-fullscreen__btn--close"
            (click)="closeFullscreen()"
            title="Close (Escape)">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
              <path fill-rule="evenodd" d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z" clip-rule="evenodd" />
            </svg>
          </button>
        </div>
        <div
          class="diagram-fullscreen__content"
          [style.transform]="'scale(' + zoom() + ')'"
          [innerHTML]="renderedDiagram()">
        </div>
        <div class="diagram-fullscreen__hint">
          Ctrl+Scroll to zoom | Press Escape to close
        </div>
      </div>
    }
  `,
  styles: [`
    .diagram-block {
      border-radius: 8px;
      overflow: hidden;
      background: var(--os-color-bg-tertiary, #1e1e1e);
      margin: 1rem 0;

      &__header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0.5rem 1rem;
        background: var(--os-color-bg-secondary, #2d2d2d);
        border-bottom: 1px solid var(--os-color-border, #404040);
      }

      &__label {
        font-size: 0.75rem;
        color: var(--os-color-text-secondary, #888);
        text-transform: uppercase;
        font-weight: 500;
      }

      &__expand {
        display: flex;
        align-items: center;
        gap: 0.25rem;
        padding: 0.25rem 0.5rem;
        border: none;
        background: transparent;
        color: var(--os-color-text-secondary, #888);
        font-size: 0.75rem;
        cursor: pointer;
        border-radius: 4px;
        transition: all 0.2s ease;

        &:hover {
          background: var(--os-color-bg-hover, #404040);
          color: var(--os-color-text-primary, #fff);
        }

        svg {
          flex-shrink: 0;
        }
      }

      &__container {
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 100px;
        overflow-x: auto;
        padding: 1rem;
        cursor: pointer;
        transition: background 0.2s ease;

        &:hover {
          background: var(--os-color-bg-secondary, #2d2d2d);
        }

        :host ::ng-deep svg {
          max-width: 100%;
          height: auto;
        }
      }

      &__loading {
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 100px;
        color: var(--os-color-text-secondary, #888);
        font-size: 0.875rem;
      }

      &__error {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.75rem;
        margin: 1rem;
        background: rgba(244, 67, 54, 0.1);
        border-radius: 4px;
      }

      &__error-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background: var(--os-color-error, #f44336);
        color: white;
        font-size: 0.75rem;
        font-weight: bold;
        flex-shrink: 0;
      }

      &__error-text {
        color: var(--os-color-error, #f44336);
        font-size: 0.875rem;
      }

      &__source {
        margin: 0 1rem 1rem;
        padding: 0.75rem;
        background: var(--os-color-bg-secondary, #2d2d2d);
        border-radius: 4px;
        overflow-x: auto;

        code {
          font-family: 'Fira Code', 'Monaco', 'Consolas', monospace;
          font-size: 0.875rem;
          line-height: 1.5;
          color: var(--os-color-text-secondary, #888);
        }
      }
    }

    .diagram-fullscreen {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      z-index: 9999;
      background: rgba(0, 0, 0, 0.95);
      display: flex;
      flex-direction: column;
      animation: fadeIn 0.2s ease;

      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }

      &__toolbar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1rem;
        background: var(--os-color-bg-secondary, #2d2d2d);
        border-bottom: 1px solid var(--os-color-border, #404040);
      }

      &__zoom-controls {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      &__zoom-level {
        min-width: 60px;
        text-align: center;
        font-size: 0.875rem;
        color: var(--os-color-text-primary, #fff);
        font-weight: 500;
      }

      &__btn {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 36px;
        height: 36px;
        border: none;
        background: var(--os-color-bg-tertiary, #1e1e1e);
        color: var(--os-color-text-secondary, #888);
        cursor: pointer;
        border-radius: 4px;
        transition: all 0.2s ease;

        &:hover:not(:disabled) {
          background: var(--os-color-bg-hover, #404040);
          color: var(--os-color-text-primary, #fff);
        }

        &:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        &--close {
          background: transparent;

          &:hover {
            background: rgba(244, 67, 54, 0.2);
            color: var(--os-color-error, #f44336);
          }
        }
      }

      &__content {
        flex: 1;
        display: flex;
        justify-content: center;
        align-items: center;
        overflow: auto;
        padding: 2rem;
        transition: transform 0.1s ease;
        transform-origin: center center;

        :host ::ng-deep svg {
          max-width: none;
          height: auto;
          filter: drop-shadow(0 0 20px rgba(0, 0, 0, 0.5));
        }
      }

      &__hint {
        padding: 0.75rem;
        text-align: center;
        font-size: 0.75rem;
        color: var(--os-color-text-secondary, #666);
        background: var(--os-color-bg-secondary, #2d2d2d);
        border-top: 1px solid var(--os-color-border, #404040);
      }
    }
  `]
})
export class DiagramBlockComponent implements OnDestroy {
  protected readonly Math = Math;

  private readonly sanitizer = inject(DomSanitizer);
  private wheelHandler: ((e: WheelEvent) => void) | null = null;

  /** Mermaid diagram code */
  readonly code = input.required<string>();

  /** Rendered SVG diagram */
  readonly renderedDiagram = signal<SafeHtml | null>(null);

  /** Error message if rendering fails */
  readonly error = signal<string | null>(null);

  /** Fullscreen mode state */
  readonly isFullscreen = signal(false);

  /** Current zoom level */
  readonly zoom = signal(1);

  constructor() {
    initMermaid();

    effect(() => {
      const code = this.code();
      if (code) {
        this.renderDiagram(code);
      }
    });

    // Setup wheel listener with passive: false to allow preventDefault
    this.wheelHandler = this.handleWheel.bind(this);
    window.addEventListener('wheel', this.wheelHandler, { passive: false });
  }

  ngOnDestroy(): void {
    // Cleanup wheel listener
    if (this.wheelHandler) {
      window.removeEventListener('wheel', this.wheelHandler);
    }
    // Restore body overflow if destroyed while fullscreen
    if (this.isFullscreen()) {
      document.body.style.overflow = '';
    }
  }

  @HostListener('window:keydown', ['$event'])
  handleKeydown(event: KeyboardEvent): void {
    if (this.isFullscreen()) {
      switch (event.key) {
        case 'Escape':
          this.closeFullscreen();
          break;
        case '+':
        case '=':
          event.preventDefault();
          this.zoomIn();
          break;
        case '-':
          event.preventDefault();
          this.zoomOut();
          break;
        case '0':
          event.preventDefault();
          this.resetZoom();
          break;
      }
    }
  }

  private handleWheel(event: WheelEvent): void {
    if (this.isFullscreen() && event.ctrlKey) {
      event.preventDefault();
      if (event.deltaY < 0) {
        this.zoomIn();
      } else {
        this.zoomOut();
      }
    }
  }

  openFullscreen(): void {
    this.isFullscreen.set(true);
    this.zoom.set(1);
    document.body.style.overflow = 'hidden';
  }

  closeFullscreen(): void {
    this.isFullscreen.set(false);
    document.body.style.overflow = '';
  }

  onOverlayClick(event: MouseEvent): void {
    // Close only if clicking on the overlay background, not the content
    if ((event.target as HTMLElement).classList.contains('diagram-fullscreen')) {
      this.closeFullscreen();
    }
  }

  zoomIn(): void {
    const currentZoom = this.zoom();
    if (currentZoom < 3) {
      this.zoom.set(Math.min(3, currentZoom + 0.25));
    }
  }

  zoomOut(): void {
    const currentZoom = this.zoom();
    if (currentZoom > 0.25) {
      this.zoom.set(Math.max(0.25, currentZoom - 0.25));
    }
  }

  resetZoom(): void {
    this.zoom.set(1);
  }

  private async renderDiagram(code: string): Promise<void> {
    try {
      this.error.set(null);
      this.renderedDiagram.set(null);

      const uniqueId = `mermaid-diagram-${++diagramIdCounter}`;
      const { svg } = await mermaid.render(uniqueId, code);

      this.renderedDiagram.set(this.sanitizer.bypassSecurityTrustHtml(svg));
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'Failed to render diagram';
      this.error.set(errorMessage);
    }
  }
}
