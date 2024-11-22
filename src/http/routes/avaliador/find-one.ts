import fastifyMultipart from "@fastify/multipart";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { decrypt } from "src/lib/crypto";
import { prisma } from "src/lib/prisma";
import type { UserJWTPayload } from "src/utils/types";

interface RouteParams {
	id: string;
}
export async function getOneAvaliador(app: FastifyInstance) {
	app.register(fastifyMultipart);
	app.get<{ Params: RouteParams }>("/avaliador/:id", async (req, reply) => {
		const { id } = req.params;

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
			const dbData = await prisma.usuario.findUnique({
				where: {
					role: "AVALIADOR",
					id: id,
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

			if (dbData) {
				const decryptAvaliable = async () => {
					dbData.email = await decrypt(dbData.email);
					return dbData;
				};
				const avaliador = await decryptAvaliable();

				return reply.status(200).send({
					data: avaliador,
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
