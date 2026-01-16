import {
  Component,
  ChangeDetectionStrategy,
  input,
  signal,
  computed,
} from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import hljs from 'highlight.js';

/**
 * Code block component with syntax highlighting and copy functionality
 * Replaces DOM manipulation approach with proper Angular component
 */
@Component({
  selector: 'os-code-block',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="code-block" [attr.data-language]="language()">
      <div class="code-block__header">
        <span class="code-block__lang">{{ language() }}</span>
        <button
          class="code-block__copy"
          [class.code-block__copy--success]="copyState() === 'success'"
          [class.code-block__copy--error]="copyState() === 'error'"
          (click)="copyCode()"
          [attr.aria-label]="'Copy code'">
          @if (copyState() === 'success') {
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
              <path fill-rule="evenodd" d="M19.916 4.626a.75.75 0 01.208 1.04l-9 13.5a.75.75 0 01-1.154.114l-6-6a.75.75 0 011.06-1.06l5.353 5.353 8.493-12.739a.75.75 0 011.04-.208z" clip-rule="evenodd" />
            </svg>
            <span>Copied!</span>
          } @else {
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
              <path fill-rule="evenodd" d="M7.502 6h7.128A3.375 3.375 0 0118 9.375v9.375a3 3 0 003-3V6.108c0-1.505-1.125-2.811-2.664-2.94a48.972 48.972 0 00-.673-.05A3 3 0 0015 1.5h-1.5a3 3 0 00-2.663 1.618c-.225.015-.45.032-.673.05C8.662 3.295 7.554 4.542 7.502 6zM13.5 3A1.5 1.5 0 0012 4.5h4.5A1.5 1.5 0 0015 3h-1.5z" clip-rule="evenodd" />
              <path fill-rule="evenodd" d="M3 9.375C3 8.339 3.84 7.5 4.875 7.5h9.75c1.036 0 1.875.84 1.875 1.875v11.25c0 1.035-.84 1.875-1.875 1.875h-9.75A1.875 1.875 0 013 20.625V9.375z" clip-rule="evenodd" />
            </svg>
            <span>{{ copyState() === 'error' ? 'Failed' : 'Copy' }}</span>
          }
        </button>
      </div>
      <pre><code [innerHTML]="highlightedCode()"></code></pre>
    </div>
  `,
  styles: [`
    .code-block {
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

      &__lang {
        font-size: 0.75rem;
        color: var(--os-color-text-secondary, #888);
        text-transform: uppercase;
        font-weight: 500;
      }

      &__copy {
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

        &--success {
          color: var(--os-color-success, #4caf50);
        }

        &--error {
          color: var(--os-color-error, #f44336);
        }

        svg {
          flex-shrink: 0;
        }
      }

      pre {
        margin: 0;
        padding: 1rem;
        overflow-x: auto;

        code {
          font-family: 'Fira Code', 'Monaco', 'Consolas', monospace;
          font-size: 0.875rem;
          line-height: 1.5;
        }
      }
    }
  `]
})
export class CodeBlockComponent {
  private readonly sanitizer: DomSanitizer;

  /** Raw code content */
  readonly code = input.required<string>();

  /** Programming language for syntax highlighting */
  readonly language = input<string>('plaintext');

  /** Copy button state */
  readonly copyState = signal<'idle' | 'success' | 'error'>('idle');

  /** Highlighted code HTML */
  readonly highlightedCode = computed((): SafeHtml => {
    const code = this.code();
    const lang = this.language();

    if (!code) {
      return '';
    }

    const validLang = hljs.getLanguage(lang) ? lang : 'plaintext';
    const highlighted = hljs.highlight(code, { language: validLang }).value;

    return this.sanitizer.bypassSecurityTrustHtml(highlighted);
  });

  constructor(sanitizer: DomSanitizer) {
    this.sanitizer = sanitizer;
  }

  async copyCode(): Promise<void> {
    try {
      await navigator.clipboard.writeText(this.code());
      this.copyState.set('success');
    } catch {
      this.fallbackCopy();
    }

    setTimeout(() => this.copyState.set('idle'), 2000);
  }

  private fallbackCopy(): void {
    const textArea = document.createElement('textarea');
    textArea.value = this.code();
    textArea.style.cssText = 'position:fixed;top:0;left:0;opacity:0';
    document.body.appendChild(textArea);
    textArea.select();

    try {
      document.execCommand('copy');
      this.copyState.set('success');
    } catch {
      this.copyState.set('error');
    } finally {
      document.body.removeChild(textArea);
    }
  }
}
