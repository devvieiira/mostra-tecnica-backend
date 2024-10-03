import { z } from "zod";
// biome-ignore lint/style/useImportType: <explanation>
import { FastifyInstance } from "fastify";
import { prisma } from "../../../lib/prisma";
import { compareHash, decrypt } from "../../../lib/crypto";
import { parseBody } from "src/utils/parseBody";
import { Prisma, type Usuario } from "@prisma/client";
import fastifyMultipart from "@fastify/multipart";

export async function signIn(app: FastifyInstance) {
	app.register(fastifyMultipart, {
		attachFieldsToBody: true,
	});
	app.post("/auth/signIn", async (request, reply) => {
		const loginBody = z.object({
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
		});

		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		const body: any = request.body;

		const fields = {
			email: body.email.value,
			senha: body.senha.value,
		};

		const data = loginBody.parse(fields);
		let user: Usuario | null;
		try {
			user = await prisma.usuario.findFirst({
				where: {
					email: data.email,
				},
			});
			// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		} catch (error: any) {
			console.error(error.message);
			if (error instanceof Prisma.PrismaClientKnownRequestError) {
				return reply.status(400).send({
					message: error.message,
					cause: error.cause,
					code: error.code,
					name: error.name,
				});
			}
			return reply.status(403).send({
				error: error,
				message: "User Not found",
			});
		}

		const isMatch =
			user && (await compareHash(data.senha, user.hashSenha ?? ""));
		if (!user || !isMatch) {
			return reply.code(401).send({
				message: "Invalid credentials",
			});
		}

		user.nome = await decrypt(user.nome);
		const payload = {
			id: user.id,
			email: user.email,
			name: user.nome,
		};

		const token = request.jwt.sign(payload);

		return { accessToken: token };
	});
}
