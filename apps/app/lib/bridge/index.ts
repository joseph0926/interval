import { RefObject, useCallback } from "react";
import { WebView } from "react-native-webview";
import { router, Href } from "expo-router";
import {
	BridgeMessage,
	BridgeResponseMessage,
	BRIDGE_ACTIONS,
	BRIDGE_RESPONSE_ACTIONS,
} from "./types";
import {
	requestNotificationPermission,
	getNotificationPermissionStatus,
	scheduleTargetTimeNotification,
	scheduleDelayReminderNotification,
	cancelAllNotifications,
	cancelNotification,
} from "../notifications";
import { triggerHaptic } from "../haptics";

export * from "./types";

export function useBridge(webViewRef: RefObject<WebView | null>) {
	const sendToWeb = useCallback(
		(message: BridgeResponseMessage) => {
			const script = `
				window.dispatchEvent(new CustomEvent('nativeMessage', {
					detail: ${JSON.stringify(message)}
				}));
				true;
			`;
			webViewRef.current?.injectJavaScript(script);
		},
		[webViewRef],
	);

	const handleMessage = useCallback(
		async (message: BridgeMessage) => {
			switch (message.action) {
				case BRIDGE_ACTIONS.NAVIGATE:
					router.push(message.payload.path as Href);
					break;

				case BRIDGE_ACTIONS.SMOKING_RECORDED:
					await handleSmokingRecorded(message.payload, sendToWeb);
					break;

				case BRIDGE_ACTIONS.REQUEST_NOTIFICATION_PERMISSION:
					await handleRequestPermission(sendToWeb);
					break;

				case BRIDGE_ACTIONS.GET_NOTIFICATION_STATUS:
					await handleGetNotificationStatus(sendToWeb);
					break;

				case BRIDGE_ACTIONS.SCHEDULE_TARGET_NOTIFICATION:
					await handleScheduleTargetNotification(message.payload, sendToWeb);
					break;

				case BRIDGE_ACTIONS.SCHEDULE_DELAY_NOTIFICATION:
					await handleScheduleDelayNotification(message.payload, sendToWeb);
					break;

				case BRIDGE_ACTIONS.CANCEL_ALL_NOTIFICATIONS:
					await cancelAllNotifications();
					sendToWeb({ action: BRIDGE_RESPONSE_ACTIONS.NOTIFICATIONS_CANCELLED });
					break;

				case BRIDGE_ACTIONS.CANCEL_NOTIFICATION:
					await cancelNotification(message.payload.id);
					break;

				case BRIDGE_ACTIONS.HAPTIC_FEEDBACK:
					await triggerHaptic(message.payload?.type);
					break;

				case BRIDGE_ACTIONS.ONBOARDING_COMPLETE:
					break;

				default: {
					const _exhaustiveCheck: never = message;
					console.warn("Unhandled bridge action:", _exhaustiveCheck);
				}
			}
		},
		[sendToWeb],
	);

	return { handleMessage, sendToWeb };
}

async function handleRequestPermission(sendToWeb: (message: BridgeResponseMessage) => void) {
	const granted = await requestNotificationPermission();
	sendToWeb({
		action: BRIDGE_RESPONSE_ACTIONS.NOTIFICATION_PERMISSION_RESULT,
		payload: { granted },
	});
}

async function handleGetNotificationStatus(sendToWeb: (message: BridgeResponseMessage) => void) {
	const granted = await getNotificationPermissionStatus();
	sendToWeb({
		action: BRIDGE_RESPONSE_ACTIONS.NOTIFICATION_STATUS,
		payload: { granted },
	});
}

async function handleScheduleTargetNotification(
	payload: { targetTime: string; motivation?: string },
	sendToWeb: (message: BridgeResponseMessage) => void,
) {
	const targetTime = new Date(payload.targetTime);

	if (isNaN(targetTime.getTime())) {
		sendToWeb({
			action: BRIDGE_RESPONSE_ACTIONS.NOTIFICATION_SCHEDULED,
			payload: { success: false, error: "Invalid targetTime format" },
		});
		return;
	}

	const notificationId = await scheduleTargetTimeNotification(targetTime, payload.motivation);

	sendToWeb({
		action: BRIDGE_RESPONSE_ACTIONS.NOTIFICATION_SCHEDULED,
		payload: {
			success: !!notificationId,
			id: notificationId,
			type: "TARGET_TIME",
		},
	});
}

async function handleScheduleDelayNotification(
	payload: { delayEndTime: string },
	sendToWeb: (message: BridgeResponseMessage) => void,
) {
	const delayEndTime = new Date(payload.delayEndTime);

	if (isNaN(delayEndTime.getTime())) {
		sendToWeb({
			action: BRIDGE_RESPONSE_ACTIONS.NOTIFICATION_SCHEDULED,
			payload: { success: false, error: "Invalid delayEndTime format" },
		});
		return;
	}

	const notificationId = await scheduleDelayReminderNotification(delayEndTime);

	sendToWeb({
		action: BRIDGE_RESPONSE_ACTIONS.NOTIFICATION_SCHEDULED,
		payload: {
			success: !!notificationId,
			id: notificationId,
			type: "DELAY_REMINDER",
		},
	});
}

async function handleSmokingRecorded(
	payload: { nextTargetTime?: string; motivation?: string } | undefined,
	sendToWeb: (message: BridgeResponseMessage) => void,
) {
	await cancelAllNotifications();

	if (payload?.nextTargetTime) {
		const targetTime = new Date(payload.nextTargetTime);

		if (!isNaN(targetTime.getTime())) {
			await scheduleTargetTimeNotification(targetTime, payload.motivation);
		}
	}

	sendToWeb({
		action: BRIDGE_RESPONSE_ACTIONS.SMOKING_RECORDED_ACK,
		payload: { success: true },
	});
}
