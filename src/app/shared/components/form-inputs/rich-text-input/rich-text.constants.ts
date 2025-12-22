/**
 * Rich Text Editor Constants
 */

export const FORMAT_TYPES = {
	BOLD: 'bold',
	ITALIC: 'italic',
	UNDERLINE: 'underline',
	PRIMARY: 'primary'
} as const;

export type FormatType = typeof FORMAT_TYPES[keyof typeof FORMAT_TYPES];

export const PRIMARY_SPAN_CLASS = 'text-primary';

export const SANITIZE_CONFIG = {
	allowedTags: [
		'div', 'span', 'p', 'b', 'i', 'u', 'strong', 'em', 'br',
		'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'
	],
	allowedAttributes: ['style', 'class', 'href', 'id'],
	allowedStyles: [
		'color', 'background-color', 'font-weight', 'font-style',
		'text-decoration', 'margin', 'padding', 'text-align'
	]
} as const;
