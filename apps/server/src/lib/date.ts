const KST_OFFSET = 9 * 60 * 60 * 1000;

export function parseTimeString(timeStr: string): { hour: number; minute: number } {
	const [hour, minute] = timeStr.split(":").map(Number);
	return { hour, minute };
}

export function getKSTDate(date: Date = new Date()): Date {
	return new Date(date.getTime() + KST_OFFSET);
}

export function getUserDayBoundary(
	date: Date,
	dayStartTime: string = "04:00",
): { start: Date; end: Date; dateStr: string } {
	const { hour: startHour, minute: startMinute } = parseTimeString(dayStartTime);
	const kstDate = getKSTDate(date);

	const currentHour = kstDate.getUTCHours();
	const currentMinute = kstDate.getUTCMinutes();

	const isBeforeDayStart =
		currentHour < startHour || (currentHour === startHour && currentMinute < startMinute);

	const baseDate = new Date(kstDate);
	if (isBeforeDayStart) {
		baseDate.setUTCDate(baseDate.getUTCDate() - 1);
	}

	const dateStr = baseDate.toISOString().split("T")[0];

	const start = new Date(`${dateStr}T00:00:00+09:00`);
	start.setUTCHours(start.getUTCHours() + startHour - 9);
	start.setUTCMinutes(startMinute);

	const end = new Date(start.getTime() + 24 * 60 * 60 * 1000 - 1);

	return { start, end, dateStr };
}

export function getKSTDateString(date: Date): string {
	const kst = getKSTDate(date);
	return kst.toISOString().split("T")[0];
}

export function getKSTStartOfDay(dateStr: string): Date {
	return new Date(`${dateStr}T00:00:00+09:00`);
}

export function getKSTEndOfDay(dateStr: string): Date {
	return new Date(`${dateStr}T23:59:59.999+09:00`);
}

export function getWeekRange(weeksAgo: number = 0, dayStartTime: string = "04:00") {
	const now = new Date();
	const { dateStr } = getUserDayBoundary(now, dayStartTime);
	const kstDate = new Date(`${dateStr}T12:00:00+09:00`);

	const dayOfWeek = kstDate.getUTCDay();
	const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

	const monday = new Date(kstDate);
	monday.setUTCDate(monday.getUTCDate() - daysToMonday - weeksAgo * 7);

	const sunday = new Date(monday);
	sunday.setUTCDate(monday.getUTCDate() + 6);

	return {
		start: getKSTStartOfDay(monday.toISOString().split("T")[0]),
		end: getKSTEndOfDay(sunday.toISOString().split("T")[0]),
	};
}

export function getHourBucket(date: Date): string {
	const hour = getKSTDate(date).getUTCHours();

	if (hour >= 6 && hour < 9) return "06-09";
	if (hour >= 9 && hour < 12) return "09-12";
	if (hour >= 12 && hour < 15) return "12-15";
	if (hour >= 15 && hour < 18) return "15-18";
	if (hour >= 18 && hour < 21) return "18-21";
	if (hour >= 21 || hour < 6) return "21-06";
	return "unknown";
}
