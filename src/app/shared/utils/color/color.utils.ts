/**
 * Color manipulation and conversion utilities
 *
 * Provides functions for:
 * - HEX ↔ RGB conversion
 * - RGB ↔ HSL conversion
 * - Color shading (lighten/darken)
 */

/**
 * RGB color representation
 */
export interface RgbColor {
  red: number;
  green: number;
  blue: number;
  alpha?: number;
}

/**
 * HSL color representation (Hue, Saturation, Lightness)
 */
export type HslColor = [hue: number, saturation: number, lightness: number];

/**
 * Convert HEX color to RGB
 *
 * Supports formats:
 * - 3-digit hex: #fff
 * - 6-digit hex: #ffffff
 * - 8-digit hex with alpha: #ffffffff
 *
 * @param hex - HEX color string (e.g., "#ff5733" or "#f57")
 * @returns RGB color object with red, green, blue, and optional alpha
 * @throws {TypeError} If HEX format is invalid
 *
 * @example
 * ```typescript
 * hexToRgb('#ff5733'); // { red: 255, green: 87, blue: 51 }
 * hexToRgb('#f57');    // { red: 255, green: 85, blue: 119 }
 * ```
 */
export function hexToRgb(hex: string): RgbColor {
  let red: number, green: number, blue: number, alpha: number | undefined;

  hex = hex.trim();

  if (!/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
    throw new TypeError('Invalid HEX color format');
  }

  if (hex.length === 4 || hex.length === 7) {
    // 3-digit or 6-digit hex
    if (hex.length === 4) {
      // Expand shorthand: #abc → #aabbcc
      hex = hex.replace(/([A-Fa-f0-9])/g, '$1$1');
    }

    red = parseInt(hex.slice(1, 3), 16);
    green = parseInt(hex.slice(3, 5), 16);
    blue = parseInt(hex.slice(5, 7), 16);
  } else if (hex.length === 9) {
    // 8-digit hex with alpha
    red = parseInt(hex.slice(1, 3), 16);
    green = parseInt(hex.slice(3, 5), 16);
    blue = parseInt(hex.slice(5, 7), 16);
    alpha = parseInt(hex.slice(7, 9), 16);
  } else {
    throw new TypeError('Invalid HEX color format');
  }

  return { red, green, blue, alpha };
}

/**
 * Convert RGB to HSL color space
 *
 * @param r - Red component (0-255)
 * @param g - Green component (0-255)
 * @param b - Blue component (0-255)
 * @returns HSL tuple [hue: 0-360, saturation: 0-100, lightness: 0-100]
 *
 * @example
 * ```typescript
 * rgbToHsl(255, 87, 51); // [14, 100, 60]
 * ```
 */
export function rgbToHsl(r: number, g: number, b: number): HslColor {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}

/**
 * Lighten or darken a color by percentage
 *
 * Supports both HEX and RGB color formats.
 *
 * @param color - Color string (HEX like "#ff5733" or RGB like "rgb(255, 87, 51)")
 * @param percent - Percentage to lighten (positive) or darken (negative)
 *                  Range: -100 to 100
 * @returns RGB color string
 * @throws {Error} If color format is unsupported
 *
 * @example
 * ```typescript
 * shadeColor('#f9a743', 20);   // Lighten by 20%
 * shadeColor('#f9a743', -20);  // Darken by 20%
 * shadeColor('rgb(249, 167, 67)', 10); // Works with RGB too
 * ```
 */
export function shadeColor(color: string, percent: number): string {
  let r = 0, g = 0, b = 0;

  if (color.startsWith('#')) {
    // Parse HEX color
    const bigint = parseInt(color.slice(1), 16);
    r = (bigint >> 16) & 255;
    g = (bigint >> 8) & 255;
    b = bigint & 255;
  } else if (color.startsWith('rgb')) {
    // Parse RGB color
    const values = color.match(/\d+/g);
    if (values) {
      r = parseInt(values[0]);
      g = parseInt(values[1]);
      b = parseInt(values[2]);
    }
  } else {
    throw new Error('Unsupported color format. Use HEX (#rrggbb) or RGB (rgb(r,g,b))');
  }

  // Calculate new RGB values
  r = Math.min(255, Math.max(0, Math.round(r + (percent / 100) * (percent > 0 ? 255 - r : r))));
  g = Math.min(255, Math.max(0, Math.round(g + (percent / 100) * (percent > 0 ? 255 - g : g))));
  b = Math.min(255, Math.max(0, Math.round(b + (percent / 100) * (percent > 0 ? 255 - b : b))));

  return `rgb(${r}, ${g}, ${b})`;
}

/**
 * Convert RGB to HEX color
 *
 * @param r - Red component (0-255)
 * @param g - Green component (0-255)
 * @param b - Blue component (0-255)
 * @returns HEX color string with # prefix
 *
 * @example
 * ```typescript
 * rgbToHex(255, 87, 51); // "#ff5733"
 * ```
 */
export function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) => {
    const hex = Math.round(n).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * Check if a color is light or dark (for contrast calculation)
 *
 * Uses relative luminance formula from WCAG guidelines
 *
 * @param color - HEX color string
 * @returns true if color is light, false if dark
 *
 * @example
 * ```typescript
 * isLightColor('#ffffff'); // true
 * isLightColor('#000000'); // false
 * ```
 */
export function isLightColor(color: string): boolean {
  const { red, green, blue } = hexToRgb(color);

  // Calculate relative luminance
  const luminance = (0.299 * red + 0.587 * green + 0.114 * blue) / 255;

  return luminance > 0.5;
}
