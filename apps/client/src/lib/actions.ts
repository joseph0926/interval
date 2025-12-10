import { api } from "./api";
import type { RecordSmokingInput, RecordSmokingResult } from "@/types/smoking.type";

export async function recordSmoking(input: RecordSmokingInput): Promise<RecordSmokingResult> {
	try {
		const res = await api.api.smoking.record.$post({
			json: {
				smokedAt: input.smokedAt?.toISOString() ?? new Date().toISOString(),
				type: input.type,
				reasonCode: input.reasonCode,
				reasonText: input.reasonText ?? undefined,
				coachingMode: input.coachingMode ?? "NONE",
				emotionNote: input.emotionNote,
				delayedMinutes: input.delayedMinutes ?? 0,
			},
		});

		const json = await res.json();

		if (!json.success) {
			return {
				success: false,
				error: "error" in json ? String(json.error) : "기록 저장에 실패했습니다",
			};
		}

		return {
			success: true,
			data: {
				intervalFromPrevious: json.record.intervalFromPrevious,
				wasOnTarget: json.record.wasOnTarget,
			},
		};
	} catch {
		return { success: false, error: "네트워크 오류가 발생했습니다" };
	}
}

export async function addDelay(
	minutes: number,
): Promise<{ success: boolean; totalDelayMinutes?: number; error?: string }> {
	try {
		const res = await api.api.smoking.delay.$post({
			json: { minutes },
		});

		const json = await res.json();

		if (!json.success) {
			return {
				success: false,
				error: "error" in json ? String(json.error) : "미루기 추가에 실패했습니다",
			};
		}

		return {
			success: true,
			totalDelayMinutes: json.totalDelayMinutes,
		};
	} catch {
		return { success: false, error: "네트워크 오류가 발생했습니다" };
	}
}

export async function updateSettings(data: {
	targetInterval?: number;
	motivation?: string;
}): Promise<{ success: boolean; error?: string }> {
	try {
		const res = await api.api.settings.$patch({
			json: {
				currentTargetInterval: data.targetInterval,
				currentMotivation: data.motivation,
			},
		});

		const json = await res.json();

		if (!json.success) {
			return {
				success: false,
				error: "error" in json ? String(json.error) : "설정 저장에 실패했습니다",
			};
		}

		return { success: true };
	} catch {
		return { success: false, error: "네트워크 오류가 발생했습니다" };
	}
}

export async function updateTodaySettings(data: {
	targetInterval: number;
	motivation: string;
}): Promise<{ success: boolean; error?: string }> {
	return updateSettings({
		targetInterval: data.targetInterval,
		motivation: data.motivation,
	});
}

export async function fetchWeeklyReport() {
	try {
		const res = await api.api.report.weekly.$get();
		const json = await res.json();
		return json.data;
	} catch {
		return null;
	}
}

export async function fetchInsight() {
	try {
		const res = await api.api.report.insight.$get();
		const json = await res.json();
		return json.data;
	} catch {
		return null;
	}
}

export async function fetchStreak() {
	try {
		const res = await api.api.report.streak.$get();
		const json = await res.json();
		return json.data;
	} catch {
		return null;
	}
}

export async function fetchSettings() {
	try {
		const res = await api.api.settings.$get();
		const json = await res.json();
		return json.settings;
	} catch {
		return null;
	}
}

export async function fetchGamificationStatus() {
	try {
		const res = await api.api.gamification.status.$get();
		const json = await res.json();
		return json.data;
	} catch {
		return null;
	}
}

export async function resetAllData(): Promise<{
	success: boolean;
	error?: string;
}> {
	try {
		const res = await api.api.smoking["soft-reset"].$post({
			json: {},
		});

		const json = await res.json();

		if (!json.success) {
			return {
				success: false,
				error: "error" in json ? String(json.error) : "초기화에 실패했습니다",
			};
		}

		return { success: true };
	} catch {
		return { success: false, error: "네트워크 오류가 발생했습니다" };
	}
}
