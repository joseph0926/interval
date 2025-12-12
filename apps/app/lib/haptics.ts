import * as Haptics from "expo-haptics";
import { Platform } from "react-native";
import type { HapticType } from "./bridge/types";

export async function triggerHaptic(type?: HapticType): Promise<void> {
	if (Platform.OS === "web") {
		return;
	}

	try {
		switch (type) {
			case "light":
				await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
				break;
			case "medium":
				await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
				break;
			case "heavy":
				await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
				break;
			case "success":
				await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
				break;
			case "warning":
				await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
				break;
			case "error":
				await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
				break;
			default:
				await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
		}
	} catch (e) {
		console.warn("Haptic feedback failed:", e);
	}
}

export async function triggerSelectionHaptic(): Promise<void> {
	if (Platform.OS === "web") {
		return;
	}

	try {
		await Haptics.selectionAsync();
	} catch (e) {
		console.warn("Selection haptic failed:", e);
	}
}
