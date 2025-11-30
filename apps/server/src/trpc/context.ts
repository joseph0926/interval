import type { CreateFastifyContextOptions } from "@trpc/server/adapters/fastify";

export function createContext({ req, res }: CreateFastifyContextOptions) {
	const prisma = req.server.prisma;

	return {
		prisma,
		req,
		res,
	};
}

export type Context = Awaited<ReturnType<typeof createContext>>;
