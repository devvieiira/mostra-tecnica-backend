import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { decrypt } from "src/lib/crypto";
import { prisma } from "src/lib/prisma";
import type { UserJWTPayload } from "src/utils/types";

export async function getTrabalho(app: FastifyInstance) {
	app.get("/trabalhos", async (req: FastifyRequest, reply: FastifyReply) => {
		let userJWTData: UserJWTPayload | null = null;

		try {
			const authorization = req.headers.authorization;
			const access_token = authorization?.split("Bearer ")[1];
			userJWTData = app.jwt.decode(access_token as string);
		} catch (error) {
			return reply.status(403).send({
				message: "Token missing",
			});
		}


		const loggedUser = await prisma.usuario.findUnique({
			where: {
				id: userJWTData?.id,
			},
		});

		if (loggedUser?.role !== "ADMIN") {
			return reply.status(401).send({
				message: "Unauthorized",
			});
		}
		try {
			const dbData = await prisma.trabalho.findMany({
				select: {
					id: true,
					instituicao: true,
					orientador: true,
					coorientador: true,
					titulo_trabalho: true,
					nivel_ensino: true,
					modalidade: true,
					area: true,
					autores: {
						select: {
							nome: true,
							email: true,
							cpf: true,
							role: true,
						},
					},
				},
			});

			const trabalhos = await Promise.all(
				dbData.map(async (item) => {
					item.instituicao = await decrypt(item.instituicao);
					item.titulo_trabalho = await decrypt(item.titulo_trabalho);
					item.nivel_ensino = await decrypt(item.nivel_ensino);
					item.autores = await Promise.all(
						item.autores.map(async (autor) => {
							autor.email = await decrypt(autor.email);
							autor.cpf = await decrypt(autor.cpf);
							return autor;
						}),
					);

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
