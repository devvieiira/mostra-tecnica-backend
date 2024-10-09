import fastifyMultipart from "@fastify/multipart";
import type { FastifyInstance } from "fastify";
import { prisma } from "src/lib/prisma";
import { parseBody } from "src/utils/parseBody";
import { z } from "zod";

interface RouteParams {
	avaliador: string;
	trabalho: string;
}

export async function avaliacao(app: FastifyInstance) {
	app.register(fastifyMultipart, {
		attachFieldsToBody: true,
	});
	app.post<{ Params: RouteParams }>(
		"/avaliacao/:avaliador/:trabalho",
		async (req, reply) => {
			const { trabalho: idTrabalho, avaliador: idAvaliador } = req.params;

			const bodySchema = z
				.object({
					nota1: z.number(),
					nota2: z.number(),
					nota3: z.number(),
					nota4: z.number(),
					nota5: z.number(),
					inclusao: z.boolean().optional(),
				})
				.refine((data) => {
					const hasNota1 = data.nota1;
					const hasNota2 = data.nota2;
					const hasNota3 = data.nota3;
					const hasNota4 = data.nota4;
					const hasNota5 = data.nota5;

					if (!hasNota1 || !hasNota2 || !hasNota3 || !hasNota4 || !hasNota5) {
						return false;
					}
					return true;
				});

			// biome-ignore lint/suspicious/noExplicitAny: <explanation>
			const body: any = req.body;
			const fields = parseBody(body);

			// Convert strings to numbers and booleans
			const nota1 = Number.parseInt(fields.nota1, 10);
			const nota2 = Number.parseInt(fields.nota2, 10);
			const nota3 = Number.parseInt(fields.nota3, 10);
			const nota4 = Number.parseInt(fields.nota4, 10);
			const nota5 = Number.parseInt(fields.nota5, 10);
			// biome-ignore lint/complexity/noUselessTernary: <explanation>
			const inclusao = fields.inclusao === "true" ? true : false;

			const parsedFields = {
				nota1,
				nota2,
				nota3,
				nota4,
				nota5,
				inclusao,
			};

			try {
				const zBody = bodySchema.parse(parsedFields);

				const average =
					(zBody.nota1 +
						zBody.nota2 +
						zBody.nota3 +
						zBody.nota4 +
						zBody.nota5) /
					5;

				await prisma.avaliacao.create({
					data: {
						trabalhoId: idTrabalho,
						usuarioId: idAvaliador,
						nota: average,
						inclusao: zBody.inclusao ?? false,
					},
				});
				return reply.status(201).send({
					message: "Avaliação created!",
					status: 201,
				});
				// biome-ignore lint/suspicious/noExplicitAny: <explanation>
			} catch (error: any) {
				return reply.status(400).send({
					message: error.message,
				});
			}
		},
	);
}
