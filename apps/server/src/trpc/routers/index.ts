import { router, publicProcedure } from "../index";

export const appRouter = router({
	health: publicProcedure.query(() => {
		return { status: "ok" };
	}),
});

export type AppRouter = typeof appRouter;
