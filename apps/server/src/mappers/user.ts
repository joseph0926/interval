import type { UserDto, UserSettings, UrgeType } from "../types/index.js";

interface UserEntity {
	id: string;
	isGuest: boolean;
	nickname: string | null;
	email: string | null;
	enabledModules: string[];
	dayAnchorMinutes: number;
	onboardingCompleted: boolean;
	notificationsEnabled: boolean;
	dailyReminderEnabled: boolean;
	dailyReminderTime: string | null;
}

export function toUserDto(user: UserEntity): UserDto {
	return {
		id: user.id,
		isGuest: user.isGuest,
		nickname: user.nickname,
		email: user.email,
		enabledModules: user.enabledModules as UrgeType[],
		dayAnchorMinutes: user.dayAnchorMinutes,
		onboardingCompleted: user.onboardingCompleted,
		notificationsEnabled: user.notificationsEnabled,
		dailyReminderEnabled: user.dailyReminderEnabled,
		dailyReminderTime: user.dailyReminderTime,
	};
}

export function toUserSettings(user: UserEntity): UserSettings {
	return {
		nickname: user.nickname,
		enabledModules: user.enabledModules as UrgeType[],
		dayAnchorMinutes: user.dayAnchorMinutes,
		notificationsEnabled: user.notificationsEnabled,
		dailyReminderEnabled: user.dailyReminderEnabled,
		dailyReminderTime: user.dailyReminderTime,
	};
}
