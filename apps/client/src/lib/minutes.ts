export function normalizeZero(n: number): number {
	return Object.is(n, -0) ? 0 : n;
}

export function formatDeltaParts(n: number): { sign: "" | "+" | "-"; value: number } {
	const v = normalizeZero(Math.trunc(n));
	if (v === 0) return { sign: "", value: 0 };
	return { sign: v > 0 ? "+" : "-", value: Math.abs(v) };
}

export function formatDeltaMinutes(n: number): string {
	const { sign, value } = formatDeltaParts(n);
	return `${sign}${value}분`;
}

export function formatEarnedMinutes(n: number): string {
	const v = normalizeZero(Math.max(0, Math.trunc(n)));
	return v === 0 ? "0분" : `+${v}분`;
}

export function formatLostMinutes(n: number): string {
	const v = normalizeZero(Math.max(0, Math.trunc(n)));
	return v === 0 ? "0분" : `-${v}분`;
}
