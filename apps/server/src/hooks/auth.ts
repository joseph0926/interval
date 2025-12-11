import type { FastifyRequest, FastifyReply } from "fastify";

export async function requireAuth(request: FastifyRequest, reply: FastifyReply) {
	if (!request.session.userId) {
		return reply.code(401).send({ success: false, error: "Unauthorized" });
	}
}
