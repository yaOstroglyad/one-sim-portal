export function shadeColor(color: string, percent: number): string {
	let r = 0, g = 0, b = 0;

	if (color.startsWith('#')) {
		const bigint = parseInt(color.slice(1), 16);
		r = (bigint >> 16) & 255;
		g = (bigint >> 8) & 255;
		b = bigint & 255;
	} else if (color.startsWith('rgb')) {
		const values = color.match(/\d+/g);
		if (values) {
			r = parseInt(values[0]);
			g = parseInt(values[1]);
			b = parseInt(values[2]);
		}
	} else {
		throw new Error('Unsupported color format');
	}

	r = Math.min(255, Math.max(0, Math.round(r + (percent / 100) * (percent > 0 ? 255 - r : r))));
	g = Math.min(255, Math.max(0, Math.round(g + (percent / 100) * (percent > 0 ? 255 - g : g))));
	b = Math.min(255, Math.max(0, Math.round(b + (percent / 100) * (percent > 0 ? 255 - b : b))));

	return `rgb(${r}, ${g}, ${b})`;
}
