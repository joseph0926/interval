import { createMiddleware } from "hono/factory";
import { getCookie } from "hono/cookie";
import { HTTPException } from "hono/http-exception";
import { db } from "../lib/db";

type Env = {
	Variables: {
		userId: string;
	};
};

export const authMiddleware = createMiddleware<Env>(async (c, next) => {
	const sessionId = getCookie(c, "interval_session");

	if (!sessionId) {
		throw new HTTPException(401, { message: "Unauthorized" });
	}

	const user = await db.user.findUnique({
		where: { id: sessionId },
	});

	if (!user) {
		throw new HTTPException(401, { message: "Invalid session" });
	}

	c.set("userId", user.id);
	await next();
});
