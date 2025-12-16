import {
	requestNotificationPermission,
	getNotificationPermissionStatus,
	scheduleTargetTimeNotification,
	scheduleDelayReminderNotification,
	cancelAllNotifications,
} from "../notifications";
import { BridgeResponseMessage, BRIDGE_RESPONSE_ACTIONS } from "./types";

type SendToWeb = (message: BridgeResponseMessage) => void;

export async function handleRequestPermission(sendToWeb: SendToWeb) {
	const granted = await requestNotificationPermission();
	sendToWeb({
		action: BRIDGE_RESPONSE_ACTIONS.NOTIFICATION_PERMISSION_RESULT,
		payload: { granted },
	});
}

export async function handleGetNotificationStatus(sendToWeb: SendToWeb) {
	const granted = await getNotificationPermissionStatus();
	sendToWeb({
		action: BRIDGE_RESPONSE_ACTIONS.NOTIFICATION_STATUS,
		payload: { granted },
	});
}

export async function handleScheduleTargetNotification(
	payload: { targetTime: string; motivation?: string },
	sendToWeb: SendToWeb,
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

	if (notificationId) {
		sendToWeb({
			action: BRIDGE_RESPONSE_ACTIONS.NOTIFICATION_SCHEDULED,
			payload: { success: true, id: notificationId, type: "TARGET_TIME" },
		});
	} else {
		sendToWeb({
			action: BRIDGE_RESPONSE_ACTIONS.NOTIFICATION_SCHEDULED,
			payload: { success: false, error: "Failed to schedule notification" },
		});
	}
}

export async function handleScheduleDelayNotification(
	payload: { delayEndTime: string },
	sendToWeb: SendToWeb,
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

	if (notificationId) {
		sendToWeb({
			action: BRIDGE_RESPONSE_ACTIONS.NOTIFICATION_SCHEDULED,
			payload: { success: true, id: notificationId, type: "DELAY_REMINDER" },
		});
	} else {
		sendToWeb({
			action: BRIDGE_RESPONSE_ACTIONS.NOTIFICATION_SCHEDULED,
			payload: { success: false, error: "Failed to schedule notification" },
		});
	}
}

export async function handleSmokingRecorded(
	payload: { nextTargetTime?: string; motivation?: string } | undefined,
	sendToWeb: SendToWeb,
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
