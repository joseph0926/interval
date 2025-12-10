import { api } from "./api";
import type { RecordSmokingInput, RecordSmokingResult } from "@/types/smoking.type";

export async function recordSmoking(input: RecordSmokingInput): Promise<RecordSmokingResult> {
	try {
		const json = await api.smoking.record({
			smokedAt: input.smokedAt?.toISOString() ?? new Date().toISOString(),
			type: input.type,
			reasonCode: input.reasonCode,
			reasonText: input.reasonText ?? undefined,
			coachingMode: input.coachingMode ?? "NONE",
			emotionNote: input.emotionNote,
			delayedMinutes: input.delayedMinutes ?? 0,
		});

		if (!json.success) {
			return {
				success: false,
				error: "기록 저장에 실패했습니다",
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
		const json = await api.smoking.delay({ minutes });

		if (!json.success) {
			return {
				success: false,
				error: "미루기 추가에 실패했습니다",
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
		const json = await api.settings.update({
			currentTargetInterval: data.targetInterval,
			currentMotivation: data.motivation,
		});

		if (!json.success) {
			return {
				success: false,
				error: "설정 저장에 실패했습니다",
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
		const json = await api.report.weekly();
		return json.data;
	} catch {
		return null;
	}
}

export async function fetchInsight() {
	try {
		const json = await api.report.insight();
		return json.data;
	} catch {
		return null;
	}
}

export async function fetchStreak() {
	try {
		const json = await api.report.streak();
		return json.data;
	} catch {
		return null;
	}
}

export async function fetchSettings() {
	try {
		const json = await api.settings.get();
		return json.settings;
	} catch {
		return null;
	}
}

export async function fetchGamificationStatus() {
	try {
		const json = await api.gamification.status();
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
		const json = await api.smoking.softReset({});

		if (!json.success) {
			return {
				success: false,
				error: "초기화에 실패했습니다",
			};
		}

		return { success: true };
	} catch {
		return { success: false, error: "네트워크 오류가 발생했습니다" };
	}
}
