// Legacy: @interval/engine types - will be replaced with @pause/engine
export type EngineModuleType = "SMOKE" | "SNS" | "CAFFEINE" | "FOCUS";
export type EngineModuleStatus =
	| "DISABLED"
	| "SETUP_REQUIRED"
	| "NO_BASELINE"
	| "COUNTDOWN"
	| "READY"
	| "GAP_DETECTED"
	| "FOCUS_IDLE"
	| "FOCUS_RUNNING"
	| "FOCUS_COACHING";
export type EngineReasonLabel = "BREAK" | "BORED" | "STRESS" | "HABIT" | "AVOID" | "LINK" | "OTHER";
export type EngineTriggerContext = "EARLY_URGE" | "FLOATING_CARD" | "FOCUS_EXTEND" | "MANUAL";
export type EngineActionKind = "CONSUME_OR_OPEN" | "SESSION_START" | "SESSION_END";
export type EngineSessionEndReason = "USER_END" | "URGE" | "AUTO";
export type EngineCtaKey =
	| "LOG_ACTION"
	| "URGE"
	| "RECOVER"
	| "START_SESSION"
	| "END_SESSION"
	| "URGE_INTERRUPT";

export interface EngineCtaPrimary {
	key: EngineCtaKey;
	enabled: boolean;
}

export interface EngineFocusSessionInfo {
	sessionStartTime: string;
	plannedMinutes: number;
	elapsedMinutes: number;
	remainingMinutes: number;
	extendedMinutes: number;
}

export interface EngineModuleState {
	moduleType: EngineModuleType;
	status: EngineModuleStatus;
	lastActionTime?: string;
	targetIntervalMin?: number;
	targetTime?: string;
	remainingMin?: number;
	actualIntervalMin?: number;
	todayEarnedMin: number;
	todayLostMin: number;
	todayNetMin: number;
	ctaPrimary: EngineCtaPrimary;
	focusSession?: EngineFocusSessionInfo;
	todayActionCount: number;
	todayFocusTotalMin: number;
	dailyGoalCount?: number;
	defaultSessionMin?: number;
}

export interface EngineIntegratedSummary {
	earnedMin: number;
	lostMin: number;
	netMin: number;
	level?: number;
	nextLevelRemainingMin?: number;
}

export interface EngineFloatingSuggestion {
	moduleType: EngineModuleType;
	remainingMin: number;
	options: Array<1 | 3>;
}

export interface EngineTodaySummary {
	dayKey: string;
	integrated: EngineIntegratedSummary;
	modules: EngineModuleState[];
	floatingSuggestion?: EngineFloatingSuggestion;
}

export interface EngineIntervalEvent {
	id: string;
	userId: string;
	moduleType: EngineModuleType;
	eventType: "ACTION" | "DELAY" | "ADJUSTMENT";
	timestamp: string;
	localDayKey: string;
	actionKind?: EngineActionKind;
	delayMinutes?: number;
	reasonLabel?: EngineReasonLabel;
	triggerContext?: EngineTriggerContext;
	payload?: Record<string, unknown>;
}

export interface EngineModuleConfig {
	dailyGoalCount?: number;
	defaultSessionMin?: number;
}

export interface EngineModuleSetting {
	moduleType: EngineModuleType;
	enabled: boolean;
	targetIntervalMin: number;
	config?: EngineModuleConfig;
}

export interface EngineSettings {
	dayAnchorMinutes: number;
	modules: EngineModuleSetting[];
}

export interface EngineWeeklyModuleReport {
	moduleType: EngineModuleType;
	earnedMin: number;
	lostMin: number;
	netMin: number;
	avgIntervalMin?: number;
	actionCount: number;
	focusTotalMin: number;
	avgSessionMin?: number;
}

export interface EngineWeeklyReport {
	weekStartDayKey: string;
	integrated: {
		earnedMin: number;
		lostMin: number;
		netMin: number;
	};
	modules: EngineWeeklyModuleReport[];
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
