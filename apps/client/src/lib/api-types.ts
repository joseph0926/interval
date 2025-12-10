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

export interface User {
	id: string;
	isGuest: boolean;
	nickname: string | null;
	email?: string | null;
	dailySmokingRange?: DailySmokingRange | null;
	dayStartTime?: string;
	currentTargetInterval?: number;
	currentMotivation?: string | null;
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
	dailySmokingRange: DailySmokingRange | null;
	dayStartTime: string;
	currentTargetInterval: number;
	currentMotivation: string | null;
	notifyOnTargetTime: boolean;
	notifyMorningDelay: boolean;
	notifyDailyReminder: boolean;
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
			reason: string;
			label: string;
			count: number;
			percentage: number;
		}>;
		peakHours: Array<{
			hour: string;
			label: string;
			count: number;
			avgInterval: number | null;
		}>;
		bestHour: { hour: string; label: string; count: number; avgInterval: number | null } | null;
		worstHour: { hour: string; label: string; count: number; avgInterval: number | null } | null;
	};
	dailyStats: Array<{
		date: string;
		totalSmoked: number;
		averageInterval: number | null;
		totalDelayMinutes: number;
	}>;
}

export interface StreakData {
	currentStreak: number;
	longestStreak: number;
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
}

export interface ApiResponse<T> {
	success: boolean;
	data?: T;
	error?: string;
}
