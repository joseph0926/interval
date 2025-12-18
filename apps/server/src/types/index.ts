import "@fastify/session";

declare module "@fastify/session" {
	interface FastifySessionObject {
		userId?: string;
	}
}

export type UrgeType = "SMOKE" | "SNS";
export type PauseEventType = "URGE" | "PAUSE_START" | "PAUSE_END";
export type PauseResult = "COMPLETED" | "GAVE_IN" | "CANCELLED";
export type TriggerSource = "MANUAL" | "WIDGET" | "SHORTCUT";
export type PauseDuration = 90 | 180;

export interface UserDto {
	id: string;
	isGuest: boolean;
	nickname: string | null;
	email?: string | null;
	enabledModules: UrgeType[];
	dayAnchorMinutes: number;
	onboardingCompleted: boolean;
	notificationsEnabled: boolean;
	dailyReminderEnabled: boolean;
	dailyReminderTime: string | null;
}

export interface UserSettings {
	nickname: string | null;
	enabledModules: UrgeType[];
	dayAnchorMinutes: number;
	notificationsEnabled: boolean;
	dailyReminderEnabled: boolean;
	dailyReminderTime: string | null;
}

export interface ModuleSettingDto {
	moduleType: UrgeType;
	enabled: boolean;
	defaultDuration: number;
	trackedApps: string[];
}

export interface PauseEventDto {
	id: string;
	urgeType: UrgeType;
	eventType: PauseEventType;
	pauseDuration: number | null;
	result: PauseResult | null;
	triggerSource: TriggerSource | null;
	snsAppName: string | null;
	timestamp: string;
	localDayKey: string;
	pauseStartEventId: string | null;
}

export interface ModuleSummary {
	totalUrges: number;
	pauseAttempts: number;
	pauseCompleted: number;
	pauseGaveIn: number;
	pauseCancelled: number;
	successRate: number;
}

export interface PauseTodaySummary {
	dayKey: string;
	totalUrges: number;
	pauseAttempts: number;
	pauseCompleted: number;
	pauseGaveIn: number;
	successRate: number;
	currentStreak: number;
	byType: {
		SMOKE: ModuleSummary;
		SNS: ModuleSummary;
	};
	lastEventAt: string | null;
}

export interface CreatePauseStartInput {
	urgeType: UrgeType;
	pauseDuration: PauseDuration;
	triggerSource?: TriggerSource;
	snsAppName?: string;
}

export interface CreatePauseEndInput {
	pauseStartEventId: string;
	result: PauseResult;
}

export interface OnboardingInput {
	enabledModules: UrgeType[];
	nickname?: string;
	dayAnchorMinutes?: number;
}

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

export interface LegacySettings {
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

export interface BadgeDefinition {
	type: string;
	name: string;
	description: string;
	condition: (totalDelayMinutes: number) => boolean;
}

export interface LegacyOnboardingInput {
	jobType?: JobType;
	enabledModules?: ModuleType[];
	dailySmokingRange: DailySmokingRange;
	targetInterval: number;
	motivation?: string;
	dayStartTime?: string;
	nickname?: string;
}
