import fastifyMultipart from "@fastify/multipart";
import type { Usuario } from "@prisma/client";
import type { FastifyInstance } from "fastify";
import { prisma } from "src/lib/prisma";
import { z } from "zod";

export async function avaliadorSignIn(app: FastifyInstance) {
	app.register(fastifyMultipart, {
		attachFieldsToBody: true,
	});

	app.post("/auth/avaliador/signIn", async (request, reply) => {
		const loginBody = z.object({
			cpf: z.string().min(11, "Invalid CPF"),
		});

		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		const body: any = request.body;

		const fields = {
			cpf: body.cpf.value,
		};

		const data = loginBody.parse(fields);

		let avaliador: Usuario | null;

		try {
			avaliador = await prisma.usuario.findFirst({
				where: {
					role: "AVALIADOR",
					cpf: data.cpf,
				},
			});

			// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		} catch (error: any) {
			return reply.status(400).send({
				message: error.message,
				cause: error.cause,
				code: error.code,
				name: error.name,
			});
		}

		if (!avaliador) {
			return reply.code(401).send({
				message: "Invalid CPF",
			});
		}

		const payload = {
			id: avaliador.id,
			cpf: avaliador.cpf,
		};

		const token = request.jwt.sign(payload);

		return { accessToken: token };
	});
}
