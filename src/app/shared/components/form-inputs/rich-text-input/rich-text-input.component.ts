import {
	AfterViewInit,
	ChangeDetectionStrategy,
	Component,
	DestroyRef,
	ElementRef,
	forwardRef,
	inject,
	input,
	signal,
	viewChild
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { HtmlDialogComponent } from '../../html-dialog';
import { TranslateModule } from '@ngx-translate/core';

import { FORMAT_TYPES, FormatType } from './rich-text.constants';
import { getPlainText, moveCursorToEnd, sanitizeHtml } from './rich-text.utils';
import {
	isSelectionInPrimarySpan,
	findPrimarySpanFromRange,
	wrapSelectionInPrimarySpan,
	unwrapPrimarySpan
} from './rich-text-selection.utils';

@Component({
	standalone: true,
	selector: 'app-rich-text-input',
	templateUrl: './rich-text-input.component.html',
	styleUrls: ['./rich-text-input.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [TranslateModule, HtmlDialogComponent],
	providers: [{
		provide: NG_VALUE_ACCESSOR,
		useExisting: forwardRef(() => RichTextInputComponent),
		multi: true
	}]
})
export class RichTextInputComponent implements AfterViewInit, ControlValueAccessor {
	private readonly destroyRef = inject(DestroyRef);

	// Inputs
	readonly label = input('');
	readonly placeholder = input('');
	readonly maxLength = input(500);

	// ViewChildren
	readonly editorElement = viewChild.required<ElementRef<HTMLElement>>('editor');
	readonly htmlDialogComponent = viewChild.required(HtmlDialogComponent);

	// State
	readonly charCount = signal(0);
	readonly isDisabled = signal(false);

	// Internal
	private value = '';
	private currentSelection: Range | null = null;
	private onChange: (value: string) => void = () => {};
	private onTouch: () => void = () => {};

	// Bound handlers for cleanup
	private readonly handleInputBound = this.handleInput.bind(this);
	private readonly handlePasteBound = this.handlePaste.bind(this);
	private readonly handleFocusBound = () => this.onTouch();
	private readonly handleBlurBound = () => this.onTouch();

	ngAfterViewInit(): void {
		const editor = this.editor;

		if (this.value) {
			editor.innerHTML = this.value;
		}

		editor.addEventListener('input', this.handleInputBound);
		editor.addEventListener('paste', this.handlePasteBound);
		editor.addEventListener('focus', this.handleFocusBound);
		editor.addEventListener('blur', this.handleBlurBound);

		this.destroyRef.onDestroy(() => this.cleanup());
	}

	// ControlValueAccessor
	writeValue(value: string): void {
		this.value = value || '';
		this.charCount.set(getPlainText(this.value).length);
		if (this.editorElement()) {
			this.editor.innerHTML = this.value;
		}
	}

	registerOnChange(fn: (value: string) => void): void {
		this.onChange = fn;
	}

	registerOnTouched(fn: () => void): void {
		this.onTouch = fn;
	}

	setDisabledState(isDisabled: boolean): void {
		this.isDisabled.set(isDisabled);
		if (this.editorElement()) {
			this.editor.contentEditable = String(!isDisabled);
		}
	}

	// Public API
	applyFormat(format: FormatType): void {
		if (this.isDisabled()) return;

		this.editor.focus();
		const selection = window.getSelection();
		if (!selection || selection.rangeCount === 0) return;

		const range = selection.getRangeAt(0);
		if (range.collapsed) return;

		if (format === FORMAT_TYPES.PRIMARY) {
			this.togglePrimaryFormat(range, selection);
		} else {
			document.execCommand(format, false, null);
		}

		this.updateModel();
	}

	openHtmlDialog(): void {
		if (this.isDisabled()) return;

		this.editor.focus();
		const selection = window.getSelection();
		if (!selection || selection.rangeCount === 0) return;

		this.currentSelection = selection.getRangeAt(0).cloneRange();
		this.htmlDialogComponent().open();
	}

	handleHtmlInserted(html: string): void {
		if (!html.trim() || !this.currentSelection) return;

		const selection = window.getSelection();
		selection?.removeAllRanges();
		selection?.addRange(this.currentSelection);

		document.execCommand('insertHTML', false, sanitizeHtml(html));
		this.updateModel();
	}

	// Private
	private get editor(): HTMLElement {
		return this.editorElement().nativeElement;
	}

	private handleInput(event: Event): void {
		if (this.isDisabled()) return;

		const content = this.editor.innerHTML;
		const plainText = getPlainText(content);

		if (plainText.length > this.maxLength()) {
			event.preventDefault();
			event.stopPropagation();
			this.editor.innerHTML = this.value;
			moveCursorToEnd(this.editor);
			return;
		}

		this.value = content;
		this.charCount.set(plainText.length);
		this.onChange(this.value);
	}

	private handlePaste(event: ClipboardEvent): void {
		event.preventDefault();
		if (this.isDisabled()) return;

		const pastedText = event.clipboardData?.getData('text/plain') || '';
		const currentLength = getPlainText(this.editor.innerHTML).length;
		const availableSpace = this.maxLength() - currentLength;

		if (availableSpace <= 0) return;

		const textToInsert = pastedText.substring(0, availableSpace);
		document.execCommand('insertText', false, textToInsert);
		this.updateModel();
	}

	private togglePrimaryFormat(range: Range, selection: Selection): void {
		if (isSelectionInPrimarySpan(range, this.editor)) {
			const primarySpan = findPrimarySpanFromRange(range, this.editor);
			if (primarySpan) {
				unwrapPrimarySpan(primarySpan, range);
			}
		} else {
			wrapSelectionInPrimarySpan(range, selection);
		}
	}

	private updateModel(): void {
		this.value = this.editor.innerHTML;
		this.charCount.set(getPlainText(this.value).length);
		this.onChange(this.value);
	}

	private cleanup(): void {
		const editor = this.editorElement()?.nativeElement;
		if (editor) {
			editor.removeEventListener('input', this.handleInputBound);
			editor.removeEventListener('paste', this.handlePasteBound);
			editor.removeEventListener('focus', this.handleFocusBound);
			editor.removeEventListener('blur', this.handleBlurBound);
		}
	}
}
