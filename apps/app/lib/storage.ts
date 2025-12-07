import * as SecureStore from "expo-secure-store";

const KEYS = {
	SESSION_ID: "interval_session_id",
	USER_DATA: "interval_user_data",
} as const;

export async function getSessionId(): Promise<string | null> {
	try {
		return await SecureStore.getItemAsync(KEYS.SESSION_ID);
	} catch {
		return null;
	}
}

export async function setSessionId(sessionId: string): Promise<void> {
	await SecureStore.setItemAsync(KEYS.SESSION_ID, sessionId);
}

export async function clearSession(): Promise<void> {
	await SecureStore.deleteItemAsync(KEYS.SESSION_ID);
	await SecureStore.deleteItemAsync(KEYS.USER_DATA);
}

export async function getUserData<T>(): Promise<T | null> {
	try {
		const data = await SecureStore.getItemAsync(KEYS.USER_DATA);
		return data ? JSON.parse(data) : null;
	} catch {
		return null;
	}
}

export async function setUserData<T>(data: T): Promise<void> {
	await SecureStore.setItemAsync(KEYS.USER_DATA, JSON.stringify(data));
}
