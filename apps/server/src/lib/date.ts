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

	const year = targetDate.getFullYear();
	const month = String(targetDate.getMonth() + 1).padStart(2, "0");
	const day = String(targetDate.getDate()).padStart(2, "0");
	return `${year}-${month}-${day}`;
}

export function getTodayRange(dayStartTime: string): { start: Date; end: Date } {
	const now = new Date();
	const [startHour, startMinute] = dayStartTime.split(":").map(Number);

	const currentHour = now.getHours();
	const currentMinute = now.getMinutes();

	const isBeforeDayStart =
		currentHour < startHour || (currentHour === startHour && currentMinute < startMinute);

	const start = new Date(now);
	start.setHours(startHour, startMinute, 0, 0);

	if (isBeforeDayStart) {
		start.setDate(start.getDate() - 1);
	}

	const end = new Date(start);
	end.setDate(end.getDate() + 1);

	return { start, end };
}

export function getWeekRange(dayStartTime: string): { start: Date; end: Date } {
	const { end } = getTodayRange(dayStartTime);

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
