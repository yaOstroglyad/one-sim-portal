import { Component, ElementRef, forwardRef, Input, OnInit, AfterViewInit, ViewChild, NgZone } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { HtmlDialogComponent } from '../html-dialog';
import { TranslateModule } from '@ngx-translate/core';

@Component({
	selector: 'app-rich-text-input',
	templateUrl: './rich-text-input.component.html',
	styleUrls: ['./rich-text-input.component.scss'],
	standalone: true,
	imports: [
		TranslateModule,
		HtmlDialogComponent
	],
	providers: [
		{
			provide: NG_VALUE_ACCESSOR,
			useExisting: forwardRef(() => RichTextInputComponent),
			multi: true
		}
	]
})
export class RichTextInputComponent implements OnInit, AfterViewInit, ControlValueAccessor {
	@Input() label = '';
	@Input() placeholder = '';
	@Input() maxLength = 500;
	@ViewChild('editor') editorElement: ElementRef;
	@ViewChild(HtmlDialogComponent) htmlDialogComponent: HtmlDialogComponent;

	value = '';
	charCount = 0;
	isDisabled = false;

	private onChange: (value: string) => void = () => {
	};
	private onTouch: () => void = () => {
	};

	// Переменная для хранения текущей позиции курсора для вставки HTML
	private currentSelection: Range = null;

	constructor(private zone: NgZone) {
	}

	ngOnInit(): void {
	}

	ngAfterViewInit(): void {
		// Инициализируем редактор вне Angular zone для предотвращения
		// нежелательных циклов обнаружения изменений
		this.zone.runOutsideAngular(() => {
			const editor = this.editorElement.nativeElement;

			// Инициализация начального содержимого, если есть
			if (this.value) {
				editor.innerHTML = this.value;
			}

			// Добавляем прямые обработчики событий для надежности
			editor.addEventListener('input', this.handleInput.bind(this));
			editor.addEventListener('paste', this.handlePaste.bind(this));
			editor.addEventListener('focus', this.handleFocus.bind(this));
			editor.addEventListener('blur', this.handleBlur.bind(this));
		});
	}

	// Обработчик ввода - работает вне Angular zone для производительности
	private handleInput(event: Event): void {
		if (this.isDisabled) return;

		const editor = this.editorElement.nativeElement;
		const content = editor.innerHTML;

		// Проверяем длину текста
		const plainText = this.getPlainText(content);

		if (plainText.length > this.maxLength) {
			// Если превышен лимит, просто отменяем последнее изменение
			// и восстанавливаем предыдущее состояние
			event.preventDefault();
			event.stopPropagation();

			// Возвращаем предыдущий контент
			editor.innerHTML = this.value;

			// Пытаемся восстановить позицию курсора
			this.restoreCursorPosition();

			return;
		}

		// Обновляем модель и счетчик символов
		this.value = content;
		this.charCount = plainText.length;

		// Оповещаем Angular о изменениях (безопасно переключаясь в Angular zone)
		this.zone.run(() => {
			this.onChange(this.value);
		});
	}

	// Сохраняем и восстанавливаем позицию курсора
	private lastCursorPosition: number = 0;

	private restoreCursorPosition(): void {
		const editor = this.editorElement.nativeElement;
		const pos = this.lastCursorPosition;

		// Функция для рекурсивного обхода узлов и поиска позиции
		const setCaretPosition = (node: Node, pos: number): number => {
			if (node.nodeType === Node.TEXT_NODE) {
				if (pos <= node.textContent.length) {
					// Нашли нужный узел, устанавливаем курсор
					const range = document.createRange();
					range.setStart(node, pos);
					range.collapse(true);

					const selection = window.getSelection();
					selection.removeAllRanges();
					selection.addRange(range);
					return -1; // Сигнализируем о завершении поиска
				} else {
					// Позиция находится после этого текстового узла
					return pos - node.textContent.length;
				}
			} else if (node.nodeType === Node.ELEMENT_NODE && node.childNodes.length > 0) {
				// Рекурсивно обходим дочерние узлы
				for (let i = 0; i < node.childNodes.length && pos >= 0; i++) {
					pos = setCaretPosition(node.childNodes[i], pos);
					if (pos === -1) break; // Позиция найдена
				}
				return pos;
			}
			return pos;
		};

		setCaretPosition(editor, pos);
	}

	private handlePaste(event: ClipboardEvent): void {
		if (this.isDisabled) {
			event.preventDefault();
			return;
		}

		// Предотвращаем стандартную вставку
		event.preventDefault();

		// Получаем только чистый текст
		const pastedText = event.clipboardData.getData('text/plain');

		// Получаем информацию о текущем состоянии редактора
		const editor = this.editorElement.nativeElement;
		const currentContent = editor.innerHTML;
		const currentPlainText = this.getPlainText(currentContent);

		// Проверяем, поместится ли вставляемый текст в лимит
		if (currentPlainText.length + pastedText.length <= this.maxLength) {
			// Вставляем текст, используя нативный метод execCommand
			document.execCommand('insertText', false, pastedText);

			// Обновляем модель
			this.value = editor.innerHTML;
			this.charCount = this.getPlainText(this.value).length;

			// Оповещаем Angular
			this.zone.run(() => {
				this.onChange(this.value);
			});
		} else {
			// Если текст не помещается в лимит, вставляем только часть текста
			const availableSpace = this.maxLength - currentPlainText.length;

			if (availableSpace > 0) {
				const truncatedText = pastedText.substring(0, availableSpace);
				document.execCommand('insertText', false, truncatedText);

				// Обновляем модель
				this.value = editor.innerHTML;
				this.charCount = this.getPlainText(this.value).length;

				// Оповещаем Angular
				this.zone.run(() => {
					this.onChange(this.value);
				});
			}
		}
	}

	private handleFocus(): void {
		// При фокусировке вызываем onTouch для соответствия интерфейсу ControlValueAccessor
		this.zone.run(() => {
			this.onTouch();
		});
	}

	private handleBlur(): void {
		// При потере фокуса также вызываем onTouch
		this.zone.run(() => {
			this.onTouch();
		});
	}

	// Метод для применения форматирования (вызывается из шаблона)
	applyFormat(format: string): void {
		if (this.isDisabled) return;

		// Фокусируем редактор
		this.editorElement.nativeElement.focus();

		// Получаем текущее выделение
		const selection = window.getSelection();
		if (!selection || selection.rangeCount === 0) return;

		const range = selection.getRangeAt(0);
		if (range.collapsed) return; // Нет выделения, ничего не делаем

		// Применяем выбранное форматирование
		if (format === 'primary') {
			// Для "primary" используем span с классом text-primary
			this.applyPrimaryFormat();
		} else {
			// Для остальных типов форматирования используем стандартные команды
			document.execCommand(format, false, null);
		}

		// Обновляем модель после форматирования
		this.value = this.editorElement.nativeElement.innerHTML;
		this.charCount = this.getPlainText(this.value).length;

		// Оповещаем Angular
		this.zone.run(() => {
			this.onChange(this.value);
		});
	}

	// Применяет форматирование primary к выделенному тексту
	private applyPrimaryFormat(): void {
		const selection = window.getSelection();
		if (!selection || selection.rangeCount === 0) return;

		const range = selection.getRangeAt(0);
		if (range.collapsed) return;

		// Проверяем, находится ли выделение внутри span с классом text-primary
		if (this.isSelectionInPrimarySpan(range)) {
			// Если да, то убираем форматирование
			this.unwrapSelectionFromPrimarySpan(range);
		} else {
			// Если нет, то добавляем форматирование
			// Извлекаем содержимое выделения
			const content = range.extractContents();

			// Создаем span с классом text-primary
			const span = document.createElement('span');
			span.className = 'text-primary';

			// Добавляем содержимое в span
			span.appendChild(content);

			// Вставляем span в позицию выделения
			range.insertNode(span);

			// Обновляем выделение, чтобы оно охватывало весь обернутый текст
			range.selectNode(span);
			selection.removeAllRanges();
			selection.addRange(range);
		}
	}

	// Проверяет, находится ли выделение внутри span с классом text-primary
	private isSelectionInPrimarySpan(range: Range): boolean {
		// Получаем общего предка для выделения
		const commonAncestor = range.commonAncestorContainer;

		// Проверяем, является ли сам предок или его родитель span с классом text-primary
		if (commonAncestor.nodeType === Node.TEXT_NODE) {
			// Если текстовый узел, проверяем его родителя
			const parent = commonAncestor.parentElement;
			if (parent && parent.tagName.toLowerCase() === 'span' && parent.classList.contains('text-primary')) {
				return true;
			}
		} else if (commonAncestor.nodeType === Node.ELEMENT_NODE) {
			// Если элемент, проверяем его напрямую
			const element = commonAncestor as HTMLElement;
			if (element.tagName.toLowerCase() === 'span' && element.classList.contains('text-primary')) {
				return true;
			}
		}

		// Иначе проверяем, полностью ли выделение находится внутри span с классом text-primary
		// Для этого проверяем начальный и конечный контейнеры выделения
		const startContainer = range.startContainer;
		const endContainer = range.endContainer;

		// Проверяем, находятся ли оба контейнера внутри одного и того же span.text-primary
		let startPrimarySpan = this.findParentPrimarySpan(startContainer);
		let endPrimarySpan = this.findParentPrimarySpan(endContainer);

		return startPrimarySpan && startPrimarySpan === endPrimarySpan;
	}

	// Находит родительский span с классом text-primary для указанного узла
	private findParentPrimarySpan(node: Node): HTMLElement | null {
		let current = node;

		// Поднимаемся вверх по дереву DOM
		while (current && current !== this.editorElement.nativeElement) {
			if (current.nodeType === Node.ELEMENT_NODE) {
				const element = current as HTMLElement;
				if (element.tagName.toLowerCase() === 'span' && element.classList.contains('text-primary')) {
					return element;
				}
			}
			current = current.parentNode;
		}

		return null;
	}

	// Удаляет обертку span с классом text-primary, сохраняя содержимое
	private unwrapSelectionFromPrimarySpan(range: Range): void {
		const commonAncestor = range.commonAncestorContainer;

		// Находим span с классом text-primary, который нужно развернуть
		let primarySpan: HTMLElement = null;

		if (commonAncestor.nodeType === Node.TEXT_NODE) {
			// Если текстовый узел, проверяем его родителя
			const parent = commonAncestor.parentElement;
			if (parent && parent.tagName.toLowerCase() === 'span' && parent.classList.contains('text-primary')) {
				primarySpan = parent;
			}
		} else if (commonAncestor.nodeType === Node.ELEMENT_NODE) {
			// Если элемент, проверяем его напрямую
			const element = commonAncestor as HTMLElement;
			if (element.tagName.toLowerCase() === 'span' && element.classList.contains('text-primary')) {
				primarySpan = element;
			} else {
				// Иначе ищем общий родительский span.text-primary для начала и конца выделения
				primarySpan = this.findParentPrimarySpan(range.startContainer);
			}
		}

		// Если нашли span, удаляем его, сохраняя содержимое
		if (primarySpan) {
			const parent = primarySpan.parentNode;

			// Создаем новый Range, который охватывает весь span
			const newRange = document.createRange();
			newRange.selectNodeContents(primarySpan);

			// Извлекаем содержимое span
			const content = newRange.extractContents();

			// Вставляем содержимое на место span
			range.setStartBefore(primarySpan);
			primarySpan.parentNode.insertBefore(content, primarySpan);

			// Удаляем пустой span
			primarySpan.parentNode.removeChild(primarySpan);

			// Восстанавливаем выделение для извлеченного содержимого
			range.setEndAfter(content);
			const selection = window.getSelection();
			selection.removeAllRanges();
			selection.addRange(range);
		}
	}

	// Открывает диалоговое окно для вставки HTML
	openHtmlDialog(): void {
		if (this.isDisabled) return;

		// Фокусируем редактор и сохраняем текущее выделение
		this.editorElement.nativeElement.focus();

		const selection = window.getSelection();
		if (!selection || selection.rangeCount === 0) return;

		// Сохраняем текущую позицию выделения для последующей вставки HTML
		this.currentSelection = selection.getRangeAt(0).cloneRange();

		// Открываем диалоговое окно через компонент
		this.zone.run(() => {
			this.htmlDialogComponent.open();
		});
	}

	// Обработчик события вставки HTML из диалогового окна
	handleHtmlInserted(html: string): void {
		if (!html.trim() || !this.currentSelection) {
			return;
		}

		// Очищаем HTML от потенциально опасных элементов
		const sanitizedHtml = this.sanitizeHtml(html);

		// Восстанавливаем сохраненное выделение
		const selection = window.getSelection();
		selection.removeAllRanges();
		selection.addRange(this.currentSelection);

		// Вставляем HTML в текущую позицию
		document.execCommand('insertHTML', false, sanitizedHtml);

		// Обновляем модель
		this.value = this.editorElement.nativeElement.innerHTML;
		this.charCount = this.getPlainText(this.value).length;

		// Оповещаем Angular
		this.zone.run(() => {
			this.onChange(this.value);
		});
	}

	// Очищает HTML от потенциально опасных элементов
	private sanitizeHtml(html: string): string {
		const allowedTags = ['div', 'span', 'p', 'b', 'i', 'u', 'strong', 'em', 'br', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
		const allowedAttrs = ['style', 'class', 'href', 'id'];
		const allowedStyles = ['color', 'background-color', 'font-weight', 'font-style', 'text-decoration', 'margin', 'padding', 'text-align'];

		const temp = document.createElement('div');
		temp.innerHTML = html;

		// Функция для рекурсивной очистки HTML
		const cleanNode = (node: Node): void => {
			// Пропускаем текстовые узлы
			if (node.nodeType === Node.TEXT_NODE) return;

			// Обрабатываем только элементы
			if (node.nodeType === Node.ELEMENT_NODE) {
				const element = node as HTMLElement;
				const tagName = element.tagName.toLowerCase();

				// Если тег не разрешен, заменяем его содержимым
				if (!allowedTags.includes(tagName)) {
					const parent = element.parentNode;
					while (element.firstChild) {
						parent.insertBefore(element.firstChild, element);
					}
					parent.removeChild(element);
					return;
				}

				// Фильтруем атрибуты
				for (let i = element.attributes.length - 1; i >= 0; i--) {
					const attr = element.attributes[i];
					if (!allowedAttrs.includes(attr.name)) {
						element.removeAttribute(attr.name);
					} else if (attr.name === 'style') {
						// Фильтруем стили
						const styles = element.style;
						const cssText = element.style.cssText;
						element.removeAttribute('style');

						// Применяем только разрешенные стили
						const styleObj = {};
						cssText.split(';').forEach(style => {
							const [prop, value] = style.split(':').map(s => s.trim());
							if (prop && value && allowedStyles.includes(prop)) {
								element.style[prop as any] = value;
							}
						});
					}
				}

				// Рекурсивно очищаем дочерние элементы
				Array.from(element.childNodes).forEach(child => {
					cleanNode(child);
				});
			}
		};

		// Очищаем все узлы
		Array.from(temp.childNodes).forEach(node => {
			cleanNode(node);
		});

		return temp.innerHTML;
	}

	// Интерфейс ControlValueAccessor
	writeValue(value: string): void {
		this.value = value || '';
		this.charCount = this.getPlainText(this.value).length;

		// Если редактор уже доступен, обновляем его содержимое
		if (this.editorElement && this.editorElement.nativeElement) {
			// Устанавливаем содержимое напрямую, без Angular привязок
			this.editorElement.nativeElement.innerHTML = this.value;
		}
	}

	registerOnChange(fn: any): void {
		this.onChange = fn;
	}

	registerOnTouched(fn: any): void {
		this.onTouch = fn;
	}

	setDisabledState(isDisabled: boolean): void {
		this.isDisabled = isDisabled;

		// Если редактор доступен, обновляем его состояние
		if (this.editorElement && this.editorElement.nativeElement) {
			this.editorElement.nativeElement.contentEditable = !isDisabled;
		}
	}

	// Вспомогательный метод для получения чистого текста из HTML
	private getPlainText(html: string): string {
		const tempElement = document.createElement('div');
		tempElement.innerHTML = html;
		return tempElement.textContent || tempElement.innerText || '';
	}
}
