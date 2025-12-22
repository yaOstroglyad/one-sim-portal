/**
 * Rich Text Editor Selection Utilities
 * Handles Selection API operations for formatting
 */

import { PRIMARY_SPAN_CLASS } from './rich-text.constants';

/**
 * Check if current selection is within a primary-styled span
 */
export function isSelectionInPrimarySpan(range: Range, editorElement: HTMLElement): boolean {
	// Case 1: Selection wraps the entire span element
	const startContainer = range.startContainer;
	if (startContainer.nodeType === Node.ELEMENT_NODE) {
		const potentialSpan = startContainer.childNodes[range.startOffset];
		if (isPrimarySpan(potentialSpan)) {
			return true;
		}
	}

	const commonAncestor = range.commonAncestorContainer;

	// Case 2: commonAncestor is text node inside primary span
	if (commonAncestor.nodeType === Node.TEXT_NODE) {
		const parent = commonAncestor.parentElement;
		if (isPrimarySpan(parent)) {
			return true;
		}
	}

	// Case 3: commonAncestor is the primary span itself
	if (isPrimarySpan(commonAncestor)) {
		return true;
	}

	// Case 4: Both start and end are inside the same primary span
	const startPrimarySpan = findParentPrimarySpan(range.startContainer, editorElement);
	const endPrimarySpan = findParentPrimarySpan(range.endContainer, editorElement);

	return !!startPrimarySpan && startPrimarySpan === endPrimarySpan;
}

/**
 * Find the parent primary span for a given node
 */
export function findParentPrimarySpan(node: Node, editorElement: HTMLElement): HTMLElement | null {
	let current: Node | null = node;

	while (current && current !== editorElement) {
		if (isPrimarySpan(current)) {
			return current as HTMLElement;
		}
		current = current.parentNode;
	}

	return null;
}

/**
 * Find primary span from selection range
 * Handles both wrapped element selection and text selection within span
 */
export function findPrimarySpanFromRange(range: Range, editorElement: HTMLElement): HTMLElement | null {
	// Case 1: Selection wraps the entire span element
	const startContainer = range.startContainer;
	if (startContainer.nodeType === Node.ELEMENT_NODE) {
		const potentialSpan = startContainer.childNodes[range.startOffset];
		if (isPrimarySpan(potentialSpan)) {
			return potentialSpan as HTMLElement;
		}
	}

	// Case 2: Selection is inside the span
	const commonAncestor = range.commonAncestorContainer;

	if (commonAncestor.nodeType === Node.TEXT_NODE) {
		const parent = commonAncestor.parentElement;
		if (isPrimarySpan(parent)) {
			return parent;
		}
	} else if (commonAncestor.nodeType === Node.ELEMENT_NODE) {
		if (isPrimarySpan(commonAncestor)) {
			return commonAncestor as HTMLElement;
		}
		return findParentPrimarySpan(range.startContainer, editorElement);
	}

	return null;
}

/**
 * Wrap selected content in a primary span
 */
export function wrapSelectionInPrimarySpan(range: Range, selection: Selection): void {
	const content = range.extractContents();
	const span = document.createElement('span');
	span.className = PRIMARY_SPAN_CLASS;
	span.appendChild(content);
	range.insertNode(span);
	range.selectNode(span);
	selection.removeAllRanges();
	selection.addRange(range);
}

/**
 * Unwrap content from a primary span
 */
export function unwrapPrimarySpan(primarySpan: HTMLElement, range: Range): void {
	const parent = primarySpan.parentNode;
	if (!parent) return;

	// Move all children out of the span before removing it
	const firstChild = primarySpan.firstChild;
	const lastChild = primarySpan.lastChild;

	while (primarySpan.firstChild) {
		parent.insertBefore(primarySpan.firstChild, primarySpan);
	}
	parent.removeChild(primarySpan);

	// Update selection to cover the unwrapped content
	if (firstChild && lastChild) {
		range.setStartBefore(firstChild);
		range.setEndAfter(lastChild);
		const selection = window.getSelection();
		selection?.removeAllRanges();
		selection?.addRange(range);
	}
}

/**
 * Check if a node is a primary-styled span
 */
function isPrimarySpan(node: Node | null | undefined): boolean {
	if (!node || node.nodeType !== Node.ELEMENT_NODE) {
		return false;
	}
	const element = node as HTMLElement;
	return element.tagName?.toLowerCase() === 'span' &&
		element.classList?.contains(PRIMARY_SPAN_CLASS);
}
