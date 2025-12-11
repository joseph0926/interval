export function getElapsedMinutes(lastSmokedAt: string | null): number {
	if (!lastSmokedAt) return 0;
	const elapsed = Date.now() - new Date(lastSmokedAt).getTime();
	return Math.round(elapsed / 1000 / 60);
}

export function getRemainingMinutes(lastSmokedAt: string | null, targetInterval: number): number {
	return Math.max(0, targetInterval - getElapsedMinutes(lastSmokedAt));
}

export function getRemainingSeconds(lastSmokedAt: string | null, targetInterval: number): number {
	if (!lastSmokedAt) return 0;
	const targetTime = new Date(lastSmokedAt).getTime() + targetInterval * 60 * 1000;
	const remainingMs = targetTime - Date.now();
	return Math.max(0, Math.ceil(remainingMs / 1000));
}

export function getTargetTime(lastSmokedAt: string | null, targetInterval: number): Date | null {
	if (!lastSmokedAt) return null;
	return new Date(new Date(lastSmokedAt).getTime() + targetInterval * 60 * 1000);
}
