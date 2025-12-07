declare global {
	interface Window {
		ReactNativeWebView?: {
			postMessage: (message: string) => void;
		};
	}
}

export interface NativeBridgeMessage {
	action: string;
	payload?: Record<string, unknown>;
}

export function isInNativeApp(): boolean {
	return typeof window !== "undefined" && !!window.ReactNativeWebView;
}

export function sendToNative(message: NativeBridgeMessage): void {
	if (!isInNativeApp()) {
		console.log("[Web] Native bridge not available:", message);
		return;
	}
	window.ReactNativeWebView?.postMessage(JSON.stringify(message));
}

export function requestNotificationPermission(): void {
	sendToNative({ action: "REQUEST_NOTIFICATION_PERMISSION" });
}

export function getNotificationStatus(): void {
	sendToNative({ action: "GET_NOTIFICATION_STATUS" });
}

export function scheduleTargetNotification(targetTime: Date, motivation?: string): void {
	sendToNative({
		action: "SCHEDULE_TARGET_NOTIFICATION",
		payload: {
			targetTime: targetTime.toISOString(),
			motivation,
		},
	});
}

export function scheduleDelayNotification(delayEndTime: Date): void {
	sendToNative({
		action: "SCHEDULE_DELAY_NOTIFICATION",
		payload: {
			delayEndTime: delayEndTime.toISOString(),
		},
	});
}

export function cancelAllNotifications(): void {
	sendToNative({ action: "CANCEL_ALL_NOTIFICATIONS" });
}

export function notifySmokingRecorded(nextTargetTime?: Date, motivation?: string): void {
	sendToNative({
		action: "SMOKING_RECORDED",
		payload: {
			nextTargetTime: nextTargetTime?.toISOString(),
			motivation,
		},
	});
}

export function triggerHaptic(
	type: "light" | "medium" | "heavy" | "success" | "warning" | "error" = "light",
): void {
	sendToNative({
		action: "HAPTIC_FEEDBACK",
		payload: { type },
	});
}

type NativeMessageHandler = (payload: Record<string, unknown>) => void;
const messageHandlers: Map<string, NativeMessageHandler[]> = new Map();

export function onNativeMessage(action: string, handler: NativeMessageHandler): () => void {
	if (!messageHandlers.has(action)) {
		messageHandlers.set(action, []);
	}
	messageHandlers.get(action)?.push(handler);

	return () => {
		const handlers = messageHandlers.get(action);
		if (handlers) {
			const index = handlers.indexOf(handler);
			if (index > -1) {
				handlers.splice(index, 1);
			}
		}
	};
}

if (typeof window !== "undefined") {
	window.addEventListener("nativeMessage", ((event: CustomEvent) => {
		const { action, payload } = event.detail as NativeBridgeMessage;
		const handlers = messageHandlers.get(action);
		handlers?.forEach((handler) => handler(payload || {}));
	}) as EventListener);
}
