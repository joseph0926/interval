import { RefObject } from "react";
import { WebView } from "react-native-webview";
import { router, Href } from "expo-router";
import {
	requestNotificationPermission,
	getNotificationPermissionStatus,
	scheduleTargetTimeNotification,
	scheduleDelayReminderNotification,
	cancelAllNotifications,
	cancelNotification,
} from "./notifications";

export interface BridgeMessage {
	action: string;
	payload?: Record<string, unknown>;
}

export function useBridge(webViewRef: RefObject<WebView | null>) {
	const sendToWeb = (message: BridgeMessage) => {
		const script = `
      window.dispatchEvent(new CustomEvent('nativeMessage', {
        detail: ${JSON.stringify(message)}
      }));
      true;
    `;
		webViewRef.current?.injectJavaScript(script);
	};

	const handleMessage = async (message: BridgeMessage) => {
		switch (message.action) {
			case "NAVIGATE":
				if (message.payload?.path) {
					router.push(message.payload.path as Href);
				}
				break;

			case "SMOKING_RECORDED":
				await handleSmokingRecorded(message.payload, sendToWeb);
				break;

			case "REQUEST_NOTIFICATION_PERMISSION":
				await handleRequestPermission(sendToWeb);
				break;

			case "GET_NOTIFICATION_STATUS":
				await handleGetNotificationStatus(sendToWeb);
				break;

			case "SCHEDULE_TARGET_NOTIFICATION":
				await handleScheduleTargetNotification(message.payload, sendToWeb);
				break;

			case "SCHEDULE_DELAY_NOTIFICATION":
				await handleScheduleDelayNotification(message.payload, sendToWeb);
				break;

			case "CANCEL_ALL_NOTIFICATIONS":
				await cancelAllNotifications();
				sendToWeb({ action: "NOTIFICATIONS_CANCELLED" });
				break;

			case "CANCEL_NOTIFICATION":
				if (message.payload?.id) {
					await cancelNotification(message.payload.id as string);
				}
				break;

			case "HAPTIC_FEEDBACK":
				triggerHaptic(message.payload?.type as string);
				break;

			default:
				console.log("Unknown action:", message.action);
		}
	};

	return { handleMessage, sendToWeb };
}

async function handleRequestPermission(sendToWeb: (message: BridgeMessage) => void) {
	const granted = await requestNotificationPermission();
	sendToWeb({
		action: "NOTIFICATION_PERMISSION_RESULT",
		payload: { granted },
	});
}

async function handleGetNotificationStatus(sendToWeb: (message: BridgeMessage) => void) {
	const granted = await getNotificationPermissionStatus();
	sendToWeb({
		action: "NOTIFICATION_STATUS",
		payload: { granted },
	});
}

async function handleScheduleTargetNotification(
	payload: Record<string, unknown> | undefined,
	sendToWeb: (message: BridgeMessage) => void,
) {
	if (!payload?.targetTime) {
		sendToWeb({
			action: "NOTIFICATION_SCHEDULED",
			payload: { success: false, error: "targetTime is required" },
		});
		return;
	}

	const targetTime = new Date(payload.targetTime as string);
	const motivation = payload.motivation as string | undefined;

	const notificationId = await scheduleTargetTimeNotification(targetTime, motivation);

	sendToWeb({
		action: "NOTIFICATION_SCHEDULED",
		payload: {
			success: !!notificationId,
			id: notificationId,
			type: "TARGET_TIME",
		},
	});
}

async function handleScheduleDelayNotification(
	payload: Record<string, unknown> | undefined,
	sendToWeb: (message: BridgeMessage) => void,
) {
	if (!payload?.delayEndTime) {
		sendToWeb({
			action: "NOTIFICATION_SCHEDULED",
			payload: { success: false, error: "delayEndTime is required" },
		});
		return;
	}

	const delayEndTime = new Date(payload.delayEndTime as string);
	const notificationId = await scheduleDelayReminderNotification(delayEndTime);

	sendToWeb({
		action: "NOTIFICATION_SCHEDULED",
		payload: {
			success: !!notificationId,
			id: notificationId,
			type: "DELAY_REMINDER",
		},
	});
}

async function handleSmokingRecorded(
	payload: Record<string, unknown> | undefined,
	sendToWeb: (message: BridgeMessage) => void,
) {
	await cancelAllNotifications();

	if (payload?.nextTargetTime) {
		const targetTime = new Date(payload.nextTargetTime as string);
		const motivation = payload.motivation as string | undefined;
		await scheduleTargetTimeNotification(targetTime, motivation);
	}

	sendToWeb({
		action: "SMOKING_RECORDED_ACK",
		payload: { success: true },
	});
}

function triggerHaptic(type?: string) {
	console.log("Trigger haptic:", type);
}
