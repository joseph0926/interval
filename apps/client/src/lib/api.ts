import { hc } from "hono/client";
import type { AppType } from "@interval/server/types";
import { env } from "./env";

export const api = hc<AppType>(env.VITE_API_URL, {
	init: {
		credentials: "include",
	},
});
