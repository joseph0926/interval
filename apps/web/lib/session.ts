import { cookies } from "next/headers";

const SESSION_COOKIE_NAME = "interval_session";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export async function setSessionUserId(userId: string) {
	const cookieStore = await cookies();

	cookieStore.set(SESSION_COOKIE_NAME, userId, {
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		sameSite: "lax",
		path: "/",
		maxAge: COOKIE_MAX_AGE,
	});
}

export async function getSessionUserId(): Promise<string | null> {
	const cookieStore = await cookies();
	return cookieStore.get(SESSION_COOKIE_NAME)?.value ?? null;
}

export async function clearSession() {
	const cookieStore = await cookies();
	cookieStore.delete(SESSION_COOKIE_NAME);
}
