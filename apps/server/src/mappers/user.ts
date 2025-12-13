import type { UserDto, Settings, DailySmokingRange, JobType, ModuleType } from "../types/index.js";

interface UserEntity {
	id: string;
	isGuest: boolean;
	nickname: string | null;
	email: string | null;
	jobType: string | null;
	enabledModules: string[];
	dailySmokingRange: string | null;
	dayStartTime: string;
	currentTargetInterval: number;
	currentMotivation: string | null;
	onboardingCompleted: boolean;
}

interface UserSettingsEntity extends UserEntity {
	notifyOnTargetTime: boolean;
	notifyMorningDelay: boolean;
	notifyDailyReminder: boolean;
}

export function toUserDto(user: UserEntity): UserDto {
	return {
		id: user.id,
		isGuest: user.isGuest,
		nickname: user.nickname,
		email: user.email,
		dailySmokingRange: user.dailySmokingRange as DailySmokingRange | null,
		dayStartTime: user.dayStartTime,
		currentTargetInterval: user.currentTargetInterval,
		currentMotivation: user.currentMotivation,
		onboardingCompleted: user.onboardingCompleted,
	};
}

export function toSettings(user: UserSettingsEntity): Settings {
	return {
		nickname: user.nickname,
		jobType: user.jobType as JobType | null,
		enabledModules: user.enabledModules as ModuleType[],
		dailySmokingRange: user.dailySmokingRange as DailySmokingRange | null,
		dayStartTime: user.dayStartTime,
		currentTargetInterval: user.currentTargetInterval,
		currentMotivation: user.currentMotivation,
		notifyOnTargetTime: user.notifyOnTargetTime,
		notifyMorningDelay: user.notifyMorningDelay,
		notifyDailyReminder: user.notifyDailyReminder,
	};
}
