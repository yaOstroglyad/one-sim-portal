export const hexRgb = (hex) => {
	let red, green, blue, alpha;

	hex = hex.trim();

	if (!/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
		throw new TypeError('Invalid HEX color format');
	}

	if (hex.length === 4 || hex.length === 7) {
		if (hex.length === 4) {
			hex = hex.replace(/([A-Fa-f0-9])/g, '$1$1');
		}

		red = parseInt(hex.slice(1, 3), 16);
		green = parseInt(hex.slice(3, 5), 16);
		blue = parseInt(hex.slice(5, 7), 16);
	} else if (hex.length === 9) {
		red = parseInt(hex.slice(1, 3), 16);
		green = parseInt(hex.slice(3, 5), 16);
		blue = parseInt(hex.slice(5, 7), 16);
		alpha = parseInt(hex.slice(7, 9), 16);
	} else {
		throw new TypeError('Invalid HEX color format');
	}

	return {
		red,
		green,
		blue,
		alpha
	};
};

export const rgbToHsl = (r: number, g: number, b: number): [number, number, number] => {
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
};
