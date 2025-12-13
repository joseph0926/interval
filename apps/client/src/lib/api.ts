import axios from "axios";
import { env } from "./env";
import type {
	User,
	TodaySummary,
	Settings,
	WeeklyReportData,
	StreakData,
	GamificationStatus,
	DailySmokingRange,
	RecordType,
	ReasonCode,
	CoachingMode,
	EngineTodaySummary,
	EngineModuleState,
	EngineIntervalEvent,
	EngineSettings,
	EngineWeeklyReport,
	EngineModuleType,
	EngineReasonLabel,
	EngineTriggerContext,
} from "./api-types";

const client = axios.create({
	baseURL: env.VITE_API_URL,
	withCredentials: true,
});

export const api = {
	auth: {
		me: async () => {
			const res = await client.get<{ success: boolean; user: User | null }>("/api/auth/me");
			return res.data;
		},
		guest: async () => {
			const res = await client.post<{ success: boolean; user: User }>("/api/auth/guest");
			return res.data;
		},
		logout: async () => {
			const res = await client.post<{ success: boolean }>("/api/auth/logout");
			return res.data;
		},
	},

	smoking: {
		today: async () => {
			const res = await client.get<{ success: boolean; data: TodaySummary }>("/api/smoking/today");
			return res.data;
		},
		record: async (data: {
			smokedAt: string;
			type: RecordType;
			reasonCode?: ReasonCode;
			reasonText?: string;
			coachingMode?: CoachingMode;
			emotionNote?: string;
			delayedMinutes?: number;
		}) => {
			const res = await client.post<{
				success: boolean;
				record: {
					id: string;
					smokedAt: string;
					type: RecordType;
					intervalFromPrevious: number | null;
					wasOnTarget: boolean | null;
					delayedMinutes: number;
				};
			}>("/api/smoking/record", data);
			return res.data;
		},
		delay: async (data: { minutes: number }) => {
			const res = await client.post<{
				success: boolean;
				totalDelayMinutes: number;
				addedMinutes: number;
			}>("/api/smoking/delay", data);
			return res.data;
		},
		softReset: async (data: { approximateCount?: number }) => {
			const res = await client.post<{ success: boolean; message: string; resetAt: string }>(
				"/api/smoking/soft-reset",
				data,
			);
			return res.data;
		},
	},

	settings: {
		get: async () => {
			const res = await client.get<{ success: boolean; settings: Settings }>("/api/settings");
			return res.data;
		},
		update: async (data: {
			nickname?: string;
			currentTargetInterval?: number;
			currentMotivation?: string;
			dayStartTime?: string;
			notifyOnTargetTime?: boolean;
			notifyMorningDelay?: boolean;
			notifyDailyReminder?: boolean;
		}) => {
			const res = await client.patch<{ success: boolean; settings: Settings }>(
				"/api/settings",
				data,
			);
			return res.data;
		},
	},

	report: {
		weekly: async () => {
			const res = await client.get<{ success: boolean; data: WeeklyReportData }>(
				"/api/report/weekly",
			);
			return res.data;
		},
		streak: async () => {
			const res = await client.get<{ success: boolean; data: StreakData }>("/api/report/streak");
			return res.data;
		},
		insight: async () => {
			const res = await client.get<{
				success: boolean;
				data: {
					message: string;
					suggestion: string;
					peakHour: { hour: string; label: string; count: number } | null;
					topReason: { reason: string; label: string; count: number } | null;
				};
			}>("/api/report/insight");
			return res.data;
		},
	},

	onboarding: {
		complete: async (data: {
			dailySmokingRange?: DailySmokingRange;
			targetInterval?: number;
			motivation?: string;
			dayStartTime?: string;
			nickname?: string;
			modules?: Array<{
				moduleType: EngineModuleType;
				enabled?: boolean;
				targetIntervalMin?: number;
				config?: {
					dailyGoalCount?: number;
					defaultSessionMin?: number;
				};
			}>;
		}) => {
			const res = await client.post<{ success: boolean; user: User }>(
				"/api/onboarding/complete",
				data,
			);
			return res.data;
		},
	},

	gamification: {
		status: async () => {
			const res = await client.get<{ success: boolean; data: GamificationStatus }>(
				"/api/gamification/status",
			);
			return res.data;
		},
	},

	engine: {
		today: async () => {
			const res = await client.get<{ success: boolean; data: EngineTodaySummary }>(
				"/api/engine/today",
			);
			return res.data;
		},

		action: async (data: {
			moduleType: EngineModuleType;
			timestamp?: string;
			reasonLabel?: EngineReasonLabel;
			actionKind?: "CONSUME_OR_OPEN" | "SESSION_START" | "SESSION_END";
			payload?: {
				plannedMinutes?: number;
				endReason?: "USER_END" | "URGE" | "AUTO";
			};
		}) => {
			const res = await client.post<{
				success: boolean;
				event: EngineIntervalEvent;
				moduleState: EngineModuleState;
			}>("/api/engine/events/action", data);
			return res.data;
		},

		delay: async (data: {
			moduleType: EngineModuleType;
			delayMinutes: 1 | 3 | 5 | 10;
			triggerContext: EngineTriggerContext;
			timestamp?: string;
		}) => {
			const res = await client.post<{
				success: boolean;
				event: EngineIntervalEvent;
				moduleState: EngineModuleState;
			}>("/api/engine/events/delay", data);
			return res.data;
		},

		adjustment: async (data: {
			moduleType: EngineModuleType;
			adjustmentKind: "RESET_BASELINE" | "APPROXIMATE_LOG";
			payload?: Record<string, unknown>;
		}) => {
			const res = await client.post<{
				success: boolean;
				event: EngineIntervalEvent;
				moduleState: EngineModuleState;
			}>("/api/engine/events/adjustment", data);
			return res.data;
		},

		weeklyReport: async (weekStart?: string) => {
			const params = weekStart ? { weekStart } : {};
			const res = await client.get<{ success: boolean; data: EngineWeeklyReport }>(
				"/api/engine/report/weekly",
				{ params },
			);
			return res.data;
		},

		getSettings: async () => {
			const res = await client.get<{ success: boolean; data: EngineSettings }>(
				"/api/engine/settings",
			);
			return res.data;
		},

		updateSettings: async (data: {
			dayAnchorMinutes?: number;
			modules?: Array<{
				moduleType: EngineModuleType;
				enabled?: boolean;
				targetIntervalMin?: number;
			}>;
		}) => {
			const res = await client.put<{ success: boolean; data: EngineSettings }>(
				"/api/engine/settings",
				data,
			);
			return res.data;
		},
	},
};
