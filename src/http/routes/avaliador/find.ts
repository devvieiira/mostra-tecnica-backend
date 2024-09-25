import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { decrypt } from "src/lib/crypto";
import { prisma } from "src/lib/prisma";

export async function getAvaliadores(app: FastifyInstance) {
	app.get("/avaliadores", async (req: FastifyRequest, reply: FastifyReply) => {
		try {
			const dbData = await prisma.usuario.findMany({
				where: {
					avaliador: true,
				},
				select: {
					id: true,
					nome: true,
					email: true,
					cpf: true,
					telefone: true,
					interesse: true,
					disponilidade: true,
					trabalhos: {
						select: {
							id: true,
						},
					},
				},
			});

			const avaliadores = await Promise.all(
				dbData.map(async (item) => {
					item.email = await decrypt(item.email);
					item.cpf = await decrypt(item.cpf);

					return item;
				}),
			);

			return reply.status(200).send({
				data: avaliadores,
			});
		} catch (error) {
			return reply.status(401).send({
				message: "An error occurred",
				error: error,
			});
		}
	});
}
