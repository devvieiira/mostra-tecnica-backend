import fastifyMultipart from "@fastify/multipart";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { decrypt } from "src/lib/crypto";
import { prisma } from "src/lib/prisma";

interface RouteParams {
	id: string;
}
export async function getOneAvaliador(app: FastifyInstance) {
	app.register(fastifyMultipart);
	app.get<{ Params: RouteParams }>("/avaliador/:id", async (req, reply) => {
		const { id } = req.params;
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
					dbData.cpf = await decrypt(dbData.cpf);
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
