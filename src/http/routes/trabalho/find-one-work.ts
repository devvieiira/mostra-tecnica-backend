import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { decrypt } from "src/lib/crypto";
import { prisma } from "src/lib/prisma";
import type { UserJWTPayload } from "src/utils/types";

interface RouteParams {
	idWork: string;
}

export async function getUniqueWork(app: FastifyInstance) {
	app.get<{ Params: RouteParams }>("/trabalho/unique/:idWork", async (req, reply) => {
		const { idWork } = req.params;
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

		if (loggedUser?.role !== "AVALIADOR" && loggedUser?.role !== "ADMIN") {
			return reply.status(401).send({
				message: "Unauthorized",
			});
		}

		try {
			const dbData = await prisma.trabalho.findUnique({
				where: {
					id: idWork,
				},
				select: {
					id: true,
					instituicao: true,
					titulo_trabalho: true,
					nivel_ensino: true,
					modalidade: true,
					autores: {
						select: {
							id: true,
							nome: true,
							email: true,
							cpf: true,
							role: true,
						},
					},
					area: true,
				},
			});

			if (dbData) {
				const decryptAvaliable = async () => {
					dbData.instituicao = await decrypt(dbData.instituicao);
					dbData.titulo_trabalho = await decrypt(dbData.titulo_trabalho)
					dbData.nivel_ensino = await decrypt(dbData.nivel_ensino)
					dbData.autores = await Promise.all(
						dbData.autores.map(async (autor) => {
							autor.email = await decrypt(autor.email)
							autor.cpf = await decrypt(autor.cpf)
							return autor
						})
					)
					return dbData;
				};
				const trabalho = await decryptAvaliable();

				return reply.status(200).send({
					data: trabalho,
				});
			}
		} catch (error) {
			return reply.status(401).send({
				message: "An error occurred",
				error: error,
			});
		}
	});
}
