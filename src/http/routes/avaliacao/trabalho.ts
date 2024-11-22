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
					nota6: z.number(),
					nota7: z.number(),
					nota8: z.number(),
					nota9: z.number(),
					nota10: z.number(),
					nota11: z.number(),
					nota12: z.number(),
					nota13: z.number(),
					nota14: z.number(),
					inclusao: z.boolean().optional(),
				})
				.refine((data) => {
					const hasNota1 = data.nota1;
					const hasNota2 = data.nota2;
					const hasNota3 = data.nota3;
					const hasNota4 = data.nota4;
					const hasNota5 = data.nota5;
					const hasNota6 = data.nota6;
					const hasNota7 = data.nota7;
					const hasNota8 = data.nota8;
					const hasNota9 = data.nota9;
					const hasNota10 = data.nota10;
					const hasNota11 = data.nota11;
					const hasNota12 = data.nota12;
					const hasNota13 = data.nota13;
					const hasNota14 = data.nota14;

					if (!hasNota1 || !hasNota2 || !hasNota3 || !hasNota4 || !hasNota5 || !hasNota6 || !hasNota7 
						|| !hasNota8 || !hasNota9 || !hasNota10 || !hasNota11 || !hasNota12 || !hasNota13 || !hasNota14) {
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
			const nota6 = Number.parseInt(fields.nota6, 10);
			const nota7 = Number.parseInt(fields.nota7, 10);
			const nota8 = Number.parseInt(fields.nota8, 10);
			const nota9 = Number.parseInt(fields.nota9, 10);
			const nota10 = Number.parseInt(fields.nota10, 10);
			const nota11 = Number.parseInt(fields.nota11, 10);
			const nota12 = Number.parseInt(fields.nota12, 10);
			const nota13 = Number.parseInt(fields.nota13, 10);
			const nota14 = Number.parseInt(fields.nota14, 10);
			// biome-ignore lint/complexity/noUselessTernary: <explanation>
			const inclusao = fields.inclusao === "true" ? true : false;

			const parsedFields = {
				nota1,
				nota2,
				nota3,
				nota4,
				nota5,
				nota6,
				nota7,
				nota8,
				nota9,
				nota10,
				nota11,
				nota12,
				nota13,
				nota14,
				inclusao,
			};

			try {
				const zBody = bodySchema.parse(parsedFields);

				const anexoB =
					((zBody.nota1 +
						zBody.nota2 +
						zBody.nota3 +
						zBody.nota4 +
						zBody.nota5))*2 /
					10;

				
					const anexoC = (
						(zBody.nota6 * 1 + zBody.nota7 * 1 + zBody.nota8 * 1 + zBody.nota9 * 1 + zBody.nota10 * 1 + zBody.nota11 * 1 + zBody.nota12 * 1.5 + zBody.nota13 * 1.5 + zBody.nota14 * 1) / 10 ) 


					const average = (anexoB + anexoC) / 2

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
