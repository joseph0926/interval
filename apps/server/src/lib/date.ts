export function getTodayDateString(dayStartTime: string): string {
	const now = new Date();
	const [startHour, startMinute] = dayStartTime.split(":").map(Number);

	const currentHour = now.getHours();
	const currentMinute = now.getMinutes();

	const isBeforeDayStart =
		currentHour < startHour || (currentHour === startHour && currentMinute < startMinute);

	const targetDate = new Date(now);
	if (isBeforeDayStart) {
		targetDate.setDate(targetDate.getDate() - 1);
	}

	return targetDate.toISOString().split("T")[0];
}

export function getTodayRange(dayStartTime: string): { start: Date; end: Date } {
	const todayStr = getTodayDateString(dayStartTime);
	const [startHour, startMinute] = dayStartTime.split(":").map(Number);

	const start = new Date(todayStr);
	start.setHours(startHour, startMinute, 0, 0);

	const end = new Date(start);
	end.setDate(end.getDate() + 1);

	return { start, end };
}

export function getWeekRange(dayStartTime: string): { start: Date; end: Date } {
	const todayStr = getTodayDateString(dayStartTime);
	const [startHour, startMinute] = dayStartTime.split(":").map(Number);

	const end = new Date(todayStr);
	end.setHours(startHour, startMinute, 0, 0);
	end.setDate(end.getDate() + 1);

	const start = new Date(end);
	start.setDate(start.getDate() - 7);

	return { start, end };
}

export function formatHourLabel(hour: number): string {
	if (hour === 0) return "오전 12시";
	if (hour < 12) return `오전 ${hour}시`;
	if (hour === 12) return "오후 12시";
	return `오후 ${hour - 12}시`;
}
