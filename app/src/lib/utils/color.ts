export const COLOR_FALLBACK = '#999999';

const HEX_RE = /^#[0-9a-fA-F]{6}$/;

export const normalizeColor = (value: string | undefined, fallback = COLOR_FALLBACK) =>
	HEX_RE.test(value ?? '') ? value! : fallback;
