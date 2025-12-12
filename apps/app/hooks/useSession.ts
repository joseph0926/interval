import { useState, useEffect, useCallback } from "react";
import { getSessionId, setSessionId, clearSession as clearStoredSession } from "@/lib/storage";

interface UseSessionReturn {
	isLoading: boolean;
	hasSession: boolean;
	sessionId: string | null;
	createSession: () => Promise<void>;
	clearSession: () => Promise<void>;
}

function generateSessionId(): string {
	const timestamp = Date.now();
	const random = Math.random().toString(36).slice(2, 11);
	return `guest_${timestamp}_${random}`;
}

export function useSession(): UseSessionReturn {
	const [isLoading, setIsLoading] = useState(true);
	const [sessionId, setSessionIdState] = useState<string | null>(null);

	const loadSession = useCallback(async () => {
		try {
			const storedSessionId = await getSessionId();
			setSessionIdState(storedSessionId);
		} catch (error) {
			console.error("Failed to load session:", error);
		} finally {
			setIsLoading(false);
		}
	}, []);

	useEffect(() => {
		loadSession();
	}, [loadSession]);

	const createSession = useCallback(async () => {
		const newSessionId = generateSessionId();
		await setSessionId(newSessionId);
		setSessionIdState(newSessionId);
	}, []);

	const clearSession = useCallback(async () => {
		await clearStoredSession();
		setSessionIdState(null);
	}, []);

	return {
		isLoading,
		hasSession: !!sessionId,
		sessionId,
		createSession,
		clearSession,
	};
}
