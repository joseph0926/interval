import { Hono } from "hono";
import { setCookie, getCookie, deleteCookie } from "hono/cookie";
import { db } from "../lib/db";
import { Errors } from "../lib/errors";
import { env } from "../lib/env";

const COOKIE_NAME = "interval_session";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

const cookieOptions = {
	httpOnly: true,
	secure: env.NODE_ENV === "production",
	sameSite: "lax" as const,
	maxAge: COOKIE_MAX_AGE,
	path: "/",
};

export const authRoutes = new Hono()
	.post("/guest", async (c) => {
		try {
			const user = await db.user.create({
				data: {
					isGuest: true,
				},
			});

			setCookie(c, COOKIE_NAME, user.id, cookieOptions);

			return c.json({
				success: true,
				user: {
					id: user.id,
					isGuest: user.isGuest,
					nickname: user.nickname,
				},
			});
		} catch {
			throw Errors.database("게스트 계정 생성에 실패했습니다");
		}
	})

	.get("/me", async (c) => {
		const sessionId = getCookie(c, COOKIE_NAME);

		if (!sessionId) {
			return c.json({ success: true, user: null });
		}

		try {
			const user = await db.user.findUnique({
				where: { id: sessionId },
				select: {
					id: true,
					isGuest: true,
					nickname: true,
					email: true,
					dailySmokingRange: true,
					dayStartTime: true,
					currentTargetInterval: true,
					currentMotivation: true,
				},
			});

			if (!user) {
				deleteCookie(c, COOKIE_NAME);
				return c.json({ success: true, user: null });
			}

			return c.json({ success: true, user });
		} catch {
			throw Errors.database("사용자 정보 조회에 실패했습니다");
		}
	})

	.post("/logout", async (c) => {
		deleteCookie(c, COOKIE_NAME);
		return c.json({ success: true });
	});
