const KST_OFFSET_MS = 9 * 60 * 60 * 1000;

export function toKST(date: Date): Date {
	return new Date(date.getTime() + KST_OFFSET_MS);
}

export function nowKST(): Date {
	return toKST(new Date());
}

export function getTodayRangeKST(): { start: Date; end: Date } {
	const now = new Date();
	const utcMidnight = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
	const kstMidnight = new Date(utcMidnight.getTime() - KST_OFFSET_MS);

	const kstNow = toKST(now);
	if (kstNow.getUTCHours() < 9) {
		kstMidnight.setTime(kstMidnight.getTime() - 24 * 60 * 60 * 1000);
	}

	const start = kstMidnight;
	const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);

	return { start, end };
}

export function getWeekRangeKST(weeksAgo: number = 0): { start: Date; end: Date } {
	const kstNow = nowKST();
	const dayOfWeek = kstNow.getUTCDay();
	const diffToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

	const monday = new Date(
		Date.UTC(kstNow.getUTCFullYear(), kstNow.getUTCMonth(), kstNow.getUTCDate()),
	);
	monday.setTime(monday.getTime() - KST_OFFSET_MS);
	monday.setUTCDate(monday.getUTCDate() - diffToMonday - weeksAgo * 7);

	const sunday = new Date(monday.getTime() + 7 * 24 * 60 * 60 * 1000);

	return { start: monday, end: sunday };
}

export function getDateKeyKST(date: Date): string {
	const kst = toKST(date);
	const year = kst.getUTCFullYear();
	const month = String(kst.getUTCMonth() + 1).padStart(2, "0");
	const day = String(kst.getUTCDate()).padStart(2, "0");
	return `${year}-${month}-${day}`;
}

export function getHoursKST(date: Date): number {
	const kst = toKST(date);
	return kst.getUTCHours();
}

export function getDayOfWeekKST(date: Date): number {
	const kst = toKST(date);
	return kst.getUTCDay();
}

export function isSameDayKST(date1: Date, date2: Date): boolean {
	return getDateKeyKST(date1) === getDateKeyKST(date2);
}

export function formatDateKST(date: Date, options?: Intl.DateTimeFormatOptions): string {
	return new Intl.DateTimeFormat("ko-KR", {
		timeZone: "Asia/Seoul",
		...options,
	}).format(date);
}

export function formatWeekRangeKST(): string {
	const { start, end } = getWeekRangeKST();
	const endDisplay = new Date(end.getTime() - 24 * 60 * 60 * 1000);

	const format = (d: Date) =>
		new Intl.DateTimeFormat("ko-KR", {
			timeZone: "Asia/Seoul",
			month: "long",
			day: "numeric",
		}).format(d);

	return `${format(start)} - ${format(endDisplay)}`;
}

export function getTodayIndexKST(): number {
	const kstNow = nowKST();
	const dayOfWeek = kstNow.getUTCDay();
	return dayOfWeek === 0 ? 6 : dayOfWeek - 1;
}

export function getMidnightKST(): Date {
	const { start } = getTodayRangeKST();
	return start;
}
