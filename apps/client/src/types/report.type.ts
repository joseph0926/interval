import type { ReasonCode } from "./smoking.type";

export interface WeeklySummary {
	averageInterval: number | null;
	totalSmoked: number;
	totalDelayMinutes: number;
	previousWeekAverageInterval: number | null;
	hasDelaySuccessDays: number;
}

export interface DailyIntervalData {
	date: string;
	dayOfWeek: string;
	averageInterval: number | null;
	totalSmoked: number;
}

export interface ReasonBreakdown {
	reasonCode: ReasonCode;
	count: number;
	percentage: number;
}

export interface TimePatternData {
	hour: number;
	count: number;
}

export interface ReportData {
	weeklySummary: WeeklySummary;
	dailyIntervals: DailyIntervalData[];
	reasonBreakdown: ReasonBreakdown[];
	peakHours: TimePatternData[];
	streakDays: number;
}
