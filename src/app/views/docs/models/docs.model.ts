/**
 * Documentation data models
 *
 * Architecture:
 * - Documents = Left sidebar navigation (array of md files)
 * - TocSection = Right sidebar (extracted from markdown headings, scroll spy)
 * - Title is extracted from first h1 in markdown content
 */

/**
 * A documentation document (left sidebar item)
 * Backend returns array of these - just id and markdown content
 * Title is extracted from first # heading in content
 */
export interface DocDocument {
  readonly id: string;           // URL slug: "public-api"
  readonly content: string;      // Markdown content (title is first h1)
}

/**
 * Processed document with extracted title (for internal use)
 */
export interface ProcessedDocDocument extends DocDocument {
  readonly title: string;        // Extracted from first h1 in content
}

/**
 * Table of Contents section (right sidebar item)
 * Extracted from markdown headings on the frontend
 */
export interface TocSection {
  readonly id: string;           // Generated from heading text
  readonly title: string;        // Heading text
  readonly level: number;        // 1 = h1, 2 = h2, 3 = h3
}
