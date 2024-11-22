import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { decrypt } from "src/lib/crypto";
import { prisma } from "src/lib/prisma";
import type { UserJWTPayload } from "src/utils/types";

export async function getAvaliadores(app: FastifyInstance) {
	app.get("/avaliadores", async (req: FastifyRequest, reply: FastifyReply) => {
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
			const dbData = await prisma.usuario.findMany({
				where: {
					role: "AVALIADOR",
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
