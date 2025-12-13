const MS_PER_MINUTE = 60 * 1000;

export function parseTimeToMinutes(timeStr: string): number {
	const [hours, minutes] = timeStr.split(":").map(Number);
	return hours * 60 + minutes;
}

export function minutesToTimeString(minutes: number): string {
	const h = Math.floor(minutes / 60);
	const m = minutes % 60;
	return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function getLocalDayKey(timestamp: Date, dayAnchorMinutes: number): string {
	const localTime = new Date(timestamp);
	const currentMinutes = localTime.getHours() * 60 + localTime.getMinutes();

	if (currentMinutes < dayAnchorMinutes) {
		localTime.setDate(localTime.getDate() - 1);
	}

	const year = localTime.getFullYear();
	const month = String(localTime.getMonth() + 1).padStart(2, "0");
	const day = String(localTime.getDate()).padStart(2, "0");
	return `${year}-${month}-${day}`;
}

export function getDayRange(dayKey: string, dayAnchorMinutes: number): { start: Date; end: Date } {
	const [year, month, day] = dayKey.split("-").map(Number);
	const anchorHours = Math.floor(dayAnchorMinutes / 60);
	const anchorMins = dayAnchorMinutes % 60;

	const start = new Date(year, month - 1, day, anchorHours, anchorMins, 0, 0);
	const end = new Date(start);
	end.setDate(end.getDate() + 1);

	return { start, end };
}

export function getDayKeyForNow(now: Date, dayAnchorMinutes: number): string {
	return getLocalDayKey(now, dayAnchorMinutes);
}

export function getElapsedMinutes(from: Date, to: Date): number {
	return Math.floor((to.getTime() - from.getTime()) / MS_PER_MINUTE);
}

export function addMinutes(date: Date, minutes: number): Date {
	return new Date(date.getTime() + minutes * MS_PER_MINUTE);
}

export function getWeekStartDayKey(dayKey: string): string {
	const [year, month, day] = dayKey.split("-").map(Number);
	const date = new Date(year, month - 1, day);
	const dayOfWeek = date.getDay();
	const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
	date.setDate(date.getDate() - diff);

	const y = date.getFullYear();
	const m = String(date.getMonth() + 1).padStart(2, "0");
	const d = String(date.getDate()).padStart(2, "0");
	return `${y}-${m}-${d}`;
}

export function getWeekDayKeys(weekStartDayKey: string): string[] {
	const [year, month, day] = weekStartDayKey.split("-").map(Number);
	const startDate = new Date(year, month - 1, day);
	const dayKeys: string[] = [];

	for (let i = 0; i < 7; i++) {
		const d = new Date(startDate);
		d.setDate(d.getDate() + i);
		const y = d.getFullYear();
		const m = String(d.getMonth() + 1).padStart(2, "0");
		const dd = String(d.getDate()).padStart(2, "0");
		dayKeys.push(`${y}-${m}-${dd}`);
	}

	return dayKeys;
}
