import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { decrypt } from "src/lib/crypto";
import { prisma } from "src/lib/prisma";

export async function deleteAvaliador(app: FastifyInstance) {
	app.delete(
		"/avaliadores",
		async (req: FastifyRequest, reply: FastifyReply) => {
			try {
				await prisma.usuario.deleteMany({
					where: {
						avaliador: true,
					},
				});

				return reply.status(204).send();
				// biome-ignore lint/suspicious/noExplicitAny: <explanation>
			} catch (error: any) {
				return reply.status(403).send({
					message: error.message,
					error: error,
				});
			}
		},
	);
}
