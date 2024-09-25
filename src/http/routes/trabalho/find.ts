import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { decrypt } from "src/lib/crypto";
import { prisma } from "src/lib/prisma";

export async function getTrabalho(app: FastifyInstance) {
	app.get("/trabalhos", async (req: FastifyRequest, reply: FastifyReply) => {
		try {
			const dbData = await prisma.trabalho.findMany({
				select: {
					id: true,
					instituicao: true,
					titulo_trabalho: true,
					nivel_ensino: true,
					autor: {
						select: {
							nome: true,
							email: true,
							cpf: true,
						},
					},
					area: true,
				},
			});

			const trabalhos = await Promise.all(
				dbData.map(async (item) => {
					item.instituicao = await decrypt(item.instituicao);
					item.titulo_trabalho = await decrypt(item.titulo_trabalho);
					item.nivel_ensino = await decrypt(item.nivel_ensino);
					item.autor.email = await decrypt(item.autor.email);
					item.autor.cpf = await decrypt(item.autor.cpf);

					return item;
				}),
			);

			return reply.status(200).send({
				data: trabalhos,
			});
		} catch (error) {
			return reply.status(401).send({
				message: "An error occurred",
				error: error,
			});
		}
	});
}
