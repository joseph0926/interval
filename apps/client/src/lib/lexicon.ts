export const TERMS = {
	balance: "잔액",
	credit: "적립",
	debit: "차감",
	depositAction: "간격 적립",
} as const;

export const FORMULAS = {
	balance: `${TERMS.balance} = ${TERMS.credit} - ${TERMS.debit}`,
} as const;

export function formatMinutesKo(min: number): string {
	const m = Math.max(0, Math.floor(min));
	if (m >= 60) {
		const h = Math.floor(m / 60);
		const r = m % 60;
		return r === 0 ? `${h}시간` : `${h}시간 ${r}분`;
	}
	return `${m}분`;
}

export function formatSignedMinutesKo(min: number): string {
	const v = Math.trunc(min);
	const sign = v > 0 ? "+" : v < 0 ? "-" : "";
	return `${sign}${formatMinutesKo(Math.abs(v))}`;
}
