import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { decrypt } from "src/lib/crypto";
import { prisma } from "src/lib/prisma";
import type { UserJWTPayload } from "src/utils/types";

export async function getAllVotedTrabalhos(app: FastifyInstance) {
	app.get("/trabalhos-votados", async (req, reply) => {
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
			// Buscar todos os votos, independentemente do usuário
			const trabalhosVotados = await prisma.avaliacao.findMany({
				select: {
					trabalhos: {
						select: {
							id: true,
							titulo_trabalho: true,
							instituicao: true,
							area: true,
							autores: {
								select: {
									nome: true,
								},
							},
						},
					},
					nota: true,
					usuario: {
						select: {
							nome: true,
							email: true,
						},
					},
				},
				orderBy: {
					nota: "desc",
				},
			});

			// Descriptografar os dados sensíveis
			const trabalhosComNotas = await Promise.all(
				trabalhosVotados.map(async (voto) => {
					const trabalho = voto.trabalhos;
					trabalho.instituicao = await decrypt(trabalho.instituicao);
					trabalho.titulo_trabalho = await decrypt(trabalho.titulo_trabalho);

					return {
						trabalhoId: trabalho.id,
						titulo_trabalho: trabalho.titulo_trabalho,
						instituicao: trabalho.instituicao,
						nota: voto.nota,
						avaliador: voto.usuario.nome,
						avaliadorEmail: voto.usuario.email,
						areaTrabalho: trabalho.area,
						autor: trabalho.autores.map((autor) => {
							return autor.nome;
						}),
					};
				}),
			);

			return reply.status(200).send({
				data: trabalhosComNotas,
			});
		} catch (error) {
			return reply.status(500).send({
				message: "An error occurred",
				error: error,
			});
		}
	});
}
