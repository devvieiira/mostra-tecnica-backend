import fastifyMultipart from "@fastify/multipart";
import type { FastifyInstance } from "fastify";
import { prisma } from "src/lib/prisma";

// interface Avaliador {
// 	id: number;
// 	nome: string;
//   email: string;
//   cpf: string;
//   telefone: string;
//   avaliador: boolean;
//   formacao: string | null;
//   interesse: string | null;
//   disponibilidade: string | null;
// }

// interface Trabalho {
// 	id: number;
// 	titulo_trabalho: string;
// }

export async function JobDraw(app: FastifyInstance) {
	app.register(fastifyMultipart);
	app.post("/job-draw", async (req, reply) => {
		try {
			const avaliadores = await prisma.usuario.findMany({
				where: { avaliador: true },
			});

			// Buscar todos os trabalhos
			const trabalhos = await prisma.trabalho.findMany();

			// Create a map to store the works by area
			// biome-ignore lint/suspicious/noExplicitAny: <explanation>
			const worksByArea: any = {};
			// biome-ignore lint/complexity/noForEach: <explanation>
			trabalhos.forEach((trabalho) => {
				if (trabalho.area) {
					if (!worksByArea[trabalho.area]) {
						worksByArea[trabalho.area] = [];
					}
					worksByArea[trabalho.area].push(trabalho);
				}
			});

			// Distribute the works equally among the evaluators
			await Promise.all(
				avaliadores.map(async (avaliador) => {
					const avaliadorInteresse = avaliador.interesse?.split(", ");
					// biome-ignore lint/suspicious/noExplicitAny: <explanation>
					const worksToAssign: any = {};
					if (avaliadorInteresse) {
						// biome-ignore lint/complexity/noForEach: <explanation>
						avaliadorInteresse.forEach((interesse) => {
							if (worksByArea[interesse]) {
								worksToAssign[interesse] = worksByArea[interesse].slice(0, 3);
							}
						});
					}
					console.log(worksToAssign);

					// console.log(avaliadorInteresse);

					await Promise.all(
						Object.keys(worksToAssign).map(async (area) => {
							const works = worksToAssign[area];
							await Promise.all(
								// biome-ignore lint/suspicious/noExplicitAny: <explanation>
								works.map(async (work: any) => {
									const existingConnections = await prisma.usuario.findFirst({
										where: {
											id: avaliador.id,
											trabalhos: {
												some: {
													id: work.id,
												},
											},
										},
									});

									if (!existingConnections) {
										await prisma.usuario.update({
											where: { id: avaliador.id },
											data: {
												trabalhos: {
													connect: { id: work.id },
												},
											},
										});
									}
								}),
							);
						}),
					);
				}),
			);

			return reply.status(201).send({
				msg: "OK",
			});
			// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		} catch (err: any) {
			return reply.status(403).send({
				msg: err.message,
				statusCode: 403,
			});
		}
	});
}
