import { useState, useEffect, useCallback } from "react";
import { getSessionId, setSessionId, clearSession as clearStoredSession } from "@/lib/storage";

interface UseSessionReturn {
	isLoading: boolean;
	hasSession: boolean;
	sessionId: string | null;
	createSession: () => Promise<void>;
	clearSession: () => Promise<void>;
}

export function useSession(): UseSessionReturn {
	const [isLoading, setIsLoading] = useState(true);
	const [sessionId, setSessionIdState] = useState<string | null>(null);

	useEffect(() => {
		loadSession();
	}, []);

	const loadSession = async () => {
		try {
			const storedSessionId = await getSessionId();
			setSessionIdState(storedSessionId);
		} catch (error) {
			console.error("Failed to load session:", error);
		} finally {
			setIsLoading(false);
		}
	};

	const createSession = useCallback(async () => {
		// 임시 세션 ID 생성 (실제로는 서버에서 받아옴)
		const newSessionId = `guest_${Date.now()}_${Math.random().toString(36).slice(2)}`;
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
