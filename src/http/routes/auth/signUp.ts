import { z } from "zod";
import type { FastifyInstance } from "fastify";
import { hashing, encrypt } from "../../../lib/crypto";
import { prisma } from "../../../lib/prisma";
import { Roles } from "@prisma/client";
import fastifyMultipart from "@fastify/multipart";
import fastifyJwt from "@fastify/jwt";

export async function signUp(app: FastifyInstance) {
	app.post("/auth/signUp", async (request, reply) => {
		const loginBody = z.object({
			nome: z.string(),
			email: z.string().email("The field is not email"),
			senha: z
				.string()
				.min(6, "The password must be 6 characters or longer")
				.refine(
					(password) => /[A-Z]/.test(password),
					"The password must contain at least one capital letter",
				)
				.refine(
					(password) => /[0-9]/.test(password),
					"The password must contain at least one number",
				)
				.refine(
					(password) => /[#-@]/.test(password),
					"The password must contain at least one of the special characters: #, -, @",
				),
			role: z.enum(["ADMIN", "AVALIADOR", "NORMAL"]),
		});

		const fields = request.body;

		const data = loginBody.parse(fields);

		const cryptoPassword = await encrypt(data.senha);
		const hashPassword = await hashing(data.senha);
		const cryptoName = await encrypt(data.nome);

		if (data.role === Roles.ADMIN) {
			return reply
				.status(400)
				.send({ message: "You cant assing ADMIN role to your account" });
		}

		try {
			await prisma.usuario.create({
				data: {
					email: data.email,
					nome: cryptoName,
					senha: cryptoPassword,
					hashSenha: hashPassword,
					role: data.role,
					cpf: "",
					telefone: "",
				},
			});

			// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		} catch (err: any) {
			console.error(err);
			return reply.status(404).send({
				message: "An error ocurried",
				code: err.code,
				errorName: err.name,
				error: err,
			});
		}

		return reply.status(201).send();
	});
}
