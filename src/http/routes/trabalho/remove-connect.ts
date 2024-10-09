import type { FastifyInstance } from "fastify";
import { prisma } from "../../../lib/prisma";
import fastifyMultipart from "@fastify/multipart";
import type { UserJWTPayload } from "src/utils/types";

interface RouteParams {
	avaliador: string;
	trabalho: string;
}

export async function DisconnectWork(app: FastifyInstance) {
	app.patch<{ Params: RouteParams }>(
		"/trabalho/avaliador/disconnect/:avaliador/:trabalho",
		async (req, reply) => {
			const { trabalho: idTrabalho, avaliador: idAvaliador } = req.params;

			if (!idTrabalho || !idAvaliador) {
				return reply.status(400).send({
					message: "Missing required parameters",
				});
			}

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
				const avaliador = await prisma.usuario.findUnique({
					where: {
						id: idAvaliador,
					},
				});

				if (!avaliador) {
					return reply.status(404).send({
						message: "Avaliador not found",
					});
				}

				const trabalho = await prisma.trabalho.findUnique({
					where: {
						id: idTrabalho,
					},
				});

				if (!trabalho) {
					return reply.status(404).send({
						message: "Trabalho not found",
					});
				}

				// Verifique se o avaliador está conectado ao trabalho
				const existingConnection = await prisma.trabalho.findFirst({
					where: {
						id: idTrabalho,
						autores: {
							some: {
								id: idAvaliador,
							},
						},
					},
				});

				if (!existingConnection) {
					return reply.status(400).send({
						message: "Avaliador not connected to trabalho",
					});
				}

				// Desconecte o avaliador do trabalho
				await prisma.trabalho.update({
					where: {
						id: idTrabalho,
					},
					data: {
						autores: {
							disconnect: {
								id: idAvaliador,
							},
						},
					},
				});

				return reply.status(200).send({
					message: "Trabalho disconnected from avaliador successfully",
				});
				// biome-ignore lint/suspicious/noExplicitAny: <explanation>
			} catch (err: any) {
				return reply.status(403).send({
					message: err.message,
					statusCode: 403,
					error: err,
				});
			}
		},
	);
}
