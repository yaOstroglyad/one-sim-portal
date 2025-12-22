/**
 * Rich Text Editor DOM Utilities
 */

import { SANITIZE_CONFIG } from './rich-text.constants';

/**
 * Extract plain text from HTML string
 */
export function getPlainText(html: string): string {
	const temp = document.createElement('div');
	temp.innerHTML = html;
	return temp.textContent || temp.innerText || '';
}

/**
 * Move cursor to the end of an element
 */
export function moveCursorToEnd(element: HTMLElement): void {
	const range = document.createRange();
	range.selectNodeContents(element);
	range.collapse(false);
	const selection = window.getSelection();
	selection?.removeAllRanges();
	selection?.addRange(range);
}

/**
 * Sanitize HTML by removing dangerous elements and attributes
 */
export function sanitizeHtml(html: string): string {
	const allowedTags = SANITIZE_CONFIG.allowedTags as readonly string[];
	const allowedAttributes = SANITIZE_CONFIG.allowedAttributes as readonly string[];
	const allowedStyles = SANITIZE_CONFIG.allowedStyles as readonly string[];

	const temp = document.createElement('div');
	temp.innerHTML = html;

	const cleanNode = (node: Node): void => {
		if (node.nodeType === Node.TEXT_NODE) return;

		if (node.nodeType === Node.ELEMENT_NODE) {
			const element = node as HTMLElement;
			const tagName = element.tagName.toLowerCase();

			// Remove disallowed tags but keep their content
			if (!allowedTags.includes(tagName)) {
				const parent = element.parentNode;
				while (element.firstChild) {
					parent?.insertBefore(element.firstChild, element);
				}
				parent?.removeChild(element);
				return;
			}

			// Filter attributes
			for (let i = element.attributes.length - 1; i >= 0; i--) {
				const attr = element.attributes[i];
				if (!allowedAttributes.includes(attr.name)) {
					element.removeAttribute(attr.name);
				} else if (attr.name === 'style') {
					filterStyles(element, allowedStyles);
				}
			}

			// Recursively clean children
			Array.from(element.childNodes).forEach(cleanNode);
		}
	};

	Array.from(temp.childNodes).forEach(cleanNode);
	return temp.innerHTML;
}

/**
 * Filter element styles to only allowed properties
 */
function filterStyles(element: HTMLElement, allowedStyles: readonly string[]): void {
	const cssText = element.style.cssText;
	element.removeAttribute('style');

	cssText.split(';').forEach(style => {
		const [prop, value] = style.split(':').map(s => s.trim());
		if (prop && value && allowedStyles.includes(prop)) {
			(element.style as any)[prop] = value;
		}
	});
}
