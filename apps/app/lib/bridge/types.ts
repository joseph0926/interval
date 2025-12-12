export const BRIDGE_ACTIONS = {
	NAVIGATE: "NAVIGATE",
	SMOKING_RECORDED: "SMOKING_RECORDED",
	REQUEST_NOTIFICATION_PERMISSION: "REQUEST_NOTIFICATION_PERMISSION",
	GET_NOTIFICATION_STATUS: "GET_NOTIFICATION_STATUS",
	SCHEDULE_TARGET_NOTIFICATION: "SCHEDULE_TARGET_NOTIFICATION",
	SCHEDULE_DELAY_NOTIFICATION: "SCHEDULE_DELAY_NOTIFICATION",
	CANCEL_ALL_NOTIFICATIONS: "CANCEL_ALL_NOTIFICATIONS",
	CANCEL_NOTIFICATION: "CANCEL_NOTIFICATION",
	HAPTIC_FEEDBACK: "HAPTIC_FEEDBACK",
	ONBOARDING_COMPLETE: "ONBOARDING_COMPLETE",
} as const;

export const BRIDGE_RESPONSE_ACTIONS = {
	NOTIFICATION_PERMISSION_RESULT: "NOTIFICATION_PERMISSION_RESULT",
	NOTIFICATION_STATUS: "NOTIFICATION_STATUS",
	NOTIFICATION_SCHEDULED: "NOTIFICATION_SCHEDULED",
	NOTIFICATIONS_CANCELLED: "NOTIFICATIONS_CANCELLED",
	SMOKING_RECORDED_ACK: "SMOKING_RECORDED_ACK",
} as const;

export type HapticType = "light" | "medium" | "heavy" | "success" | "warning" | "error";

export type NavigateMessage = {
	action: typeof BRIDGE_ACTIONS.NAVIGATE;
	payload: { path: string };
};

export type SmokingRecordedMessage = {
	action: typeof BRIDGE_ACTIONS.SMOKING_RECORDED;
	payload?: { nextTargetTime?: string; motivation?: string };
};

export type RequestNotificationPermissionMessage = {
	action: typeof BRIDGE_ACTIONS.REQUEST_NOTIFICATION_PERMISSION;
	payload?: undefined;
};

export type GetNotificationStatusMessage = {
	action: typeof BRIDGE_ACTIONS.GET_NOTIFICATION_STATUS;
	payload?: undefined;
};

export type ScheduleTargetNotificationMessage = {
	action: typeof BRIDGE_ACTIONS.SCHEDULE_TARGET_NOTIFICATION;
	payload: { targetTime: string; motivation?: string };
};

export type ScheduleDelayNotificationMessage = {
	action: typeof BRIDGE_ACTIONS.SCHEDULE_DELAY_NOTIFICATION;
	payload: { delayEndTime: string };
};

export type CancelAllNotificationsMessage = {
	action: typeof BRIDGE_ACTIONS.CANCEL_ALL_NOTIFICATIONS;
	payload?: undefined;
};

export type CancelNotificationMessage = {
	action: typeof BRIDGE_ACTIONS.CANCEL_NOTIFICATION;
	payload: { id: string };
};

export type HapticFeedbackMessage = {
	action: typeof BRIDGE_ACTIONS.HAPTIC_FEEDBACK;
	payload?: { type?: HapticType };
};

export type OnboardingCompleteMessage = {
	action: typeof BRIDGE_ACTIONS.ONBOARDING_COMPLETE;
	payload?: undefined;
};

export type BridgeMessage =
	| NavigateMessage
	| SmokingRecordedMessage
	| RequestNotificationPermissionMessage
	| GetNotificationStatusMessage
	| ScheduleTargetNotificationMessage
	| ScheduleDelayNotificationMessage
	| CancelAllNotificationsMessage
	| CancelNotificationMessage
	| HapticFeedbackMessage
	| OnboardingCompleteMessage;

export type BridgeResponseMessage = {
	action: string;
	payload?: Record<string, unknown>;
};

export function isValidBridgeMessage(data: unknown): data is BridgeMessage {
	if (typeof data !== "object" || data === null) {
		return false;
	}

	const message = data as { action?: unknown };
	if (typeof message.action !== "string") {
		return false;
	}

	return Object.values(BRIDGE_ACTIONS).includes(
		message.action as (typeof BRIDGE_ACTIONS)[keyof typeof BRIDGE_ACTIONS],
	);
}

export function parseBridgeMessage(jsonString: string): BridgeMessage | null {
	try {
		const data = JSON.parse(jsonString);
		if (isValidBridgeMessage(data)) {
			return data;
		}
		console.warn("Invalid bridge message structure:", data);
		return null;
	} catch (e) {
		console.error("Failed to parse bridge message:", e);
		return null;
	}
}
