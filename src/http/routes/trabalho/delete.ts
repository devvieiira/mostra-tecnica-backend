import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { prisma } from "src/lib/prisma";
import type { UserJWTPayload } from "src/utils/types";

export async function deleteTrabalho(app: FastifyInstance) {
	app.delete("/trabalhos", async (req: FastifyRequest, reply: FastifyReply) => {
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
			await prisma.trabalho.deleteMany();

			return reply.status(204).send();
			// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		} catch (error: any) {
			return reply.status(403).send({
				message: error.message,
				error: error,
			});
		}
	});
}
