import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform } from "react-native";

const NOTIFICATION_CONFIG = {
	CHANNEL_ID: "interval-reminders",
	CHANNEL_NAME: "간격 알림",
	VIBRATION_PATTERN: [0, 250, 250, 250],
	LIGHT_COLOR: "#000000",
} as const;

Notifications.setNotificationHandler({
	handleNotification: async () => ({
		shouldShowAlert: true,
		shouldPlaySound: true,
		shouldSetBadge: false,
		shouldShowBanner: true,
		shouldShowList: true,
	}),
});

export async function setupNotificationChannel(): Promise<void> {
	if (Platform.OS === "android") {
		await Notifications.setNotificationChannelAsync(NOTIFICATION_CONFIG.CHANNEL_ID, {
			name: NOTIFICATION_CONFIG.CHANNEL_NAME,
			importance: Notifications.AndroidImportance.HIGH,
			vibrationPattern: [...NOTIFICATION_CONFIG.VIBRATION_PATTERN],
			lightColor: NOTIFICATION_CONFIG.LIGHT_COLOR,
			sound: "default",
		});
	}
}

export async function requestNotificationPermission(): Promise<boolean> {
	if (!Device.isDevice) {
		console.warn("알림은 실제 기기에서만 작동합니다.");
		return false;
	}

	const { status: existingStatus } = await Notifications.getPermissionsAsync();
	let finalStatus = existingStatus;

	if (existingStatus !== "granted") {
		const { status } = await Notifications.requestPermissionsAsync();
		finalStatus = status;
	}

	if (finalStatus !== "granted") {
		console.warn("알림 권한이 거부되었습니다.");
		return false;
	}

	await setupNotificationChannel();
	return true;
}

export async function getNotificationPermissionStatus(): Promise<boolean> {
	const { status } = await Notifications.getPermissionsAsync();
	return status === "granted";
}

export interface ScheduleNotificationInput {
	title: string;
	body: string;
	triggerAt: Date;
	data?: Record<string, unknown>;
}

export async function scheduleNotification(
	input: ScheduleNotificationInput,
): Promise<string | null> {
	const hasPermission = await getNotificationPermissionStatus();
	if (!hasPermission) {
		console.warn("알림 권한이 없습니다.");
		return null;
	}

	const now = new Date();
	const secondsUntilTrigger = Math.max(
		1,
		Math.floor((input.triggerAt.getTime() - now.getTime()) / 1000),
	);

	const id = await Notifications.scheduleNotificationAsync({
		content: {
			title: input.title,
			body: input.body,
			data: input.data,
			sound: "default",
		},
		trigger: {
			type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
			seconds: secondsUntilTrigger,
			channelId: Platform.OS === "android" ? NOTIFICATION_CONFIG.CHANNEL_ID : undefined,
		},
	});

	return id;
}

export async function scheduleTargetTimeNotification(
	targetTime: Date,
	motivation?: string,
): Promise<string | null> {
	return scheduleNotification({
		title: "목표 시간이 됐어요",
		body: motivation || "이제 담배를 피워도 괜찮아요. 잘하고 있어요!",
		triggerAt: targetTime,
		data: { type: "TARGET_TIME_REACHED" },
	});
}

export async function scheduleDelayReminderNotification(
	delayEndTime: Date,
): Promise<string | null> {
	return scheduleNotification({
		title: "5분 미루기 완료!",
		body: "대단해요. 담배와 5분의 거리를 더 벌렸어요.",
		triggerAt: delayEndTime,
		data: { type: "DELAY_COMPLETED" },
	});
}

export async function cancelAllNotifications(): Promise<void> {
	await Notifications.cancelAllScheduledNotificationsAsync();
}

export async function cancelNotification(id: string): Promise<void> {
	await Notifications.cancelScheduledNotificationAsync(id);
}

export async function getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
	return Notifications.getAllScheduledNotificationsAsync();
}
