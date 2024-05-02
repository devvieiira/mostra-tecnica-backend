// biome-ignore lint/style/useImportType: <explanation>
import { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "../../../lib/prisma";
import type { Fields, UserJWTPayload } from "../../../utils/types";
import fs from "node:fs";
import util from "node:util";
import { pipeline } from "node:stream";
import { randomUUID } from "node:crypto";

interface RouteParams {
	id: string;
}

export async function EditCandidate(app: FastifyInstance) {
	app.patch<{
		Params: RouteParams;
	}>("/candidate/:id", async (req, reply) => {
		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		const body: any = await req.body;
		const { id } = req.params;

		const pump = util.promisify(pipeline);

		const fields = {
			name: body.name.value,
			cod: Number(body.cod.value),
			description: body.description.value,
			politicalPartyId: body.politicalPartyId.value,
		};
		const bodyschema = z.object({
			cod: z.number().optional(),
			name: z.string().optional(),
			picPath: z.string().optional().optional(),
			politicalPartyId: z.string().optional(),
			description: z.string().optional(),
		});
		const data = bodyschema.parse(fields);
		const { access_token } = req.cookies;

		const userJWTData: UserJWTPayload | null = app.jwt.decode(
			access_token as string,
		);

		const loggedUser = await prisma.user.findUnique({
			where: {
				email: userJWTData?.email,
			},
		});

		if (loggedUser?.role !== "ADMIN") {
			return reply.status(403).send({
				message: "Action not permitted",
			});
		}

		let file

		if(body.photo) {
			file = body.photo.toBuffer()
		}

		try {
			if (file) {
				const uid = randomUUID();
				await pump(
					file,
					fs.createWriteStream(`uploads/${uid}-${body.photo.filename}`),
				);
				data.picPath = `${uid}-${body.photo.filename}`;

				await prisma.candidate.update({
					where: {
						id,
					},
					data: {
						cod: data.cod,
						description: data.description,
						name: data.name,
						picPath: data.picPath,
						politicalPartyId: data.politicalPartyId,
					},
				});
			}
			if (!data.picPath) {
				await prisma.candidate.update({
					where: {
						id,
					},
					data: {
						cod: data.cod,
						description: data.description,
						name: data.name,
						politicalPartyId: data.politicalPartyId,
					},
				});
			}

			return reply.status(201).send();
			// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		} catch (err: any) {
			return reply.status(403).send({
				message: err.message,
				statusCode: 403,
			});
		}
	});
}
