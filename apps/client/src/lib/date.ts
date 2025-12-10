export function getKSTMidnight(): Date {
	const now = new Date();
	const kst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
	kst.setUTCHours(0, 0, 0, 0);
	return new Date(kst.getTime() - 9 * 60 * 60 * 1000);
}

export function formatDate(date: Date): string {
	return new Intl.DateTimeFormat("ko-KR", {
		month: "long",
		day: "numeric",
		weekday: "long",
	}).format(date);
}

export function formatTime(seconds: number): string {
	const mins = Math.floor(seconds / 60);
	const secs = seconds % 60;
	return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function formatTimeFromMidnight(): string {
	const now = new Date();
	const midnight = getKSTMidnight();
	const diffMs = now.getTime() - midnight.getTime();
	const diffMins = Math.floor(diffMs / 1000 / 60);
	const hours = Math.floor(diffMins / 60);
	const mins = diffMins % 60;
	return `${hours}시간 ${mins}분`;
}
