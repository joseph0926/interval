export type {
	ModuleType as EngineModuleType,
	ModuleStatus as EngineModuleStatus,
	ModuleState as EngineModuleState,
	TodaySummary as EngineTodaySummary,
	IntegratedSummary as EngineIntegratedSummary,
	ReasonLabel as EngineReasonLabel,
	TriggerContext as EngineTriggerContext,
	FloatingSuggestion as EngineFloatingSuggestion,
	FocusSessionInfo as EngineFocusSessionInfo,
	ActionKind as EngineActionKind,
	SessionEndReason as EngineSessionEndReason,
	CtaKey as EngineCtaKey,
	CtaPrimary as EngineCtaPrimary,
	IntervalEvent as EngineIntervalEvent,
	ModuleConfig as EngineModuleConfig,
	ModuleSetting as EngineModuleSetting,
	UserEngineSettings as EngineSettings,
	WeeklyModuleReport as EngineWeeklyModuleReport,
	WeeklyReport as EngineWeeklyReport,
} from "@interval/engine";

export type DailySmokingRange = "UNDER_5" | "FROM_5_10" | "FROM_10_20" | "OVER_20" | "UNKNOWN";
export type RecordType = "FIRST" | "NORMAL" | "EARLY";
export type ReasonCode =
	| "BREAK_TIME"
	| "STRESS"
	| "HABIT"
	| "BORED"
	| "SOCIAL"
	| "AFTER_MEAL"
	| "OTHER";
export type CoachingMode = "NONE" | "LIGHT" | "FULL";

export type JobType = "OFFICE" | "REMOTE" | "SHIFT" | "FIELD" | "OTHER";

export type ModuleType = "SMOKING" | "SNS" | "FOCUS" | "COFFEE";

export interface User {
	id: string;
	isGuest: boolean;
	nickname: string | null;
	email?: string | null;
	jobType?: JobType | null;
	enabledModules?: ModuleType[];
	dailySmokingRange?: DailySmokingRange | null;
	dayStartTime?: string;
	currentTargetInterval?: number;
	currentMotivation?: string | null;
	onboardingCompleted?: boolean;
}

export interface TodaySummary {
	totalSmoked: number;
	averageInterval: number | null;
	totalDelayMinutes: number;
	targetInterval: number;
	motivation: string | null;
	lastSmokedAt: string | null;
	firstSmokedAt: string | null;
	nextTargetTime: string | null;
	earlyCount: number;
	dayStartTime: string;
}

export interface SmokingRecord {
	id: string;
	smokedAt: string;
	type: RecordType;
	intervalFromPrevious: number | null;
	wasOnTarget: boolean | null;
	delayedMinutes: number;
}

export interface Settings {
	nickname: string | null;
	jobType: JobType | null;
	enabledModules: ModuleType[];
	dailySmokingRange: DailySmokingRange | null;
	dayStartTime: string;
	currentTargetInterval: number;
	currentMotivation: string | null;
	notifyOnTargetTime: boolean;
	notifyMorningDelay: boolean;
	notifyDailyReminder: boolean;
}

export interface DistanceBank {
	today: number;
	thisWeek: number;
	total: number;
}

export interface WeeklyReportData {
	summary: {
		avgInterval: number | null;
		intervalChange: number | null;
		totalDelayMinutes: number;
		totalSmoked: number;
		delaySuccessDays: number;
	};
	patterns: {
		topReasons: Array<{
			reason: ReasonCode;
			label: string;
			count: number;
			percentage: number;
		}>;
		peakHours: Array<{
			hour: number;
			label: string;
			count: number;
			avgInterval: number | null;
		}>;
		bestHour: { hour: number; label: string; count: number; avgInterval: number | null } | null;
		worstHour: { hour: number; label: string; count: number; avgInterval: number | null } | null;
	};
	dailyStats: Array<{
		date: string;
		totalSmoked: number;
		averageInterval: number | null;
		totalDelayMinutes: number;
	}>;
	distanceBank: DistanceBank;
}

export interface StreakData {
	currentStreak: number;
	longestStreak: number;
}

export interface InsightData {
	message: string;
	suggestion: string;
	peakHour: { hour: number; label: string; count: number } | null;
	topReason: { reason: ReasonCode; label: string; count: number } | null;
}

export interface GamificationStatus {
	level: number;
	totalDelayMinutes: number;
	nextLevel: number | null;
	minutesToNextLevel: number | null;
	badges: Array<{
		type: string;
		name: string;
		description: string;
		earned: boolean;
		earnedAt: string | null;
	}>;
	earnedBadgesCount: number;
	distanceBank: DistanceBank;
}

export interface RecordSmokingInput {
	smokedAt: string;
	type: RecordType;
	reasonCode?: ReasonCode;
	reasonText?: string;
	coachingMode?: CoachingMode;
	emotionNote?: string;
	delayedMinutes?: number;
}

export interface OnboardingInput {
	jobType?: JobType;
	enabledModules?: ModuleType[];
	dailySmokingRange: DailySmokingRange;
	targetInterval: number;
	motivation?: string;
	dayStartTime?: string;
	nickname?: string;
}

export interface ApiResponse<T> {
	success: boolean;
	data?: T;
	error?: string;
}
