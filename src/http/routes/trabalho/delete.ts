import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { prisma } from "src/lib/prisma";

export async function deleteTrabalho(app: FastifyInstance) {
	app.delete("/trabalhos", async (req: FastifyRequest, reply: FastifyReply) => {
		try {
			await prisma.trabalho.deleteMany();

			return reply.status(204).send();
			// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		} catch (error: any) {
			return reply.status(403).send({
				message: error.message,
				error: error,
			});
		}
	});
}
