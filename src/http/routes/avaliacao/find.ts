import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { prisma } from "src/lib/prisma";

export async function getAvaliacaoUsuarioId(app: FastifyInstance) {
	app.get(
		"/avaliacao/usuarioId",
		async (req: FastifyRequest, reply: FastifyReply) => {
			try {
				const dbData = await prisma.avaliacao.findMany({
					select: {
						usuarioId: true,
						trabalhoId: true,
					},
				});

				return reply.status(200).send({
					data: dbData,
				});
			} catch (error) {
				return reply.status(401).send({
					message: "An error occurred",
					error: error,
				});
			}
		},
	);
}
