import type { FastifyInstance } from "fastify";
import { prisma } from "../../../lib/prisma";
import util from "node:util";
import XLSX from "xlsx";
import fs from "node:fs";
import { pipeline } from "node:stream";
import { randomUUID } from "node:crypto";
import fastifyMultipart from "@fastify/multipart";
import path from "node:path";
import { encrypt } from "src/lib/crypto";

interface ResData {
	D: string;
	E: string;
	F: string;
	G: string;
}

export async function ImportAvaliador(app: FastifyInstance) {
	app.register(fastifyMultipart);
	app.post("/avaliador/import", async (req, reply) => {
		const data = await req.file();

		//Verifica a existencia do arquivo
		if (!data) {
			return reply.status(404).send({
				message: "File not provided",
			});
		}

		const extension = path.extname(data.filename);
		//Verifica se o tipo do arquivo é xlsx
		if (extension !== ".xlsx") {
			return reply.status(400).send({
				message: "File must be xlsx",
			});
		}

		//cria a pasta uploads para o armazenamento do arquivo

		fs.access("uploads", fs.constants.F_OK, (err) => {
			if (err) {
				fs.mkdirSync("uploads");
			}
		});

		const uid = randomUUID();
		const filePath = `uploads/${uid}-${data.filename}`;
		const writeStream = fs.createWriteStream(filePath);
		const pump = util.promisify(pipeline);
		await pump(data.file, writeStream);

		const fileBuffer = await fs.promises.readFile(filePath);
		const workbook = XLSX.read(fileBuffer, { type: "buffer" });

		const sheetNames = workbook.SheetNames;
		// biome-ignore lint/correctness/noUnreachable: <explanation>
		for (let i = 0; i < sheetNames.length; i++) {
			const worksheet = workbook.Sheets[sheetNames[i]];
			const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: "A" });

			try {
				const user = await prisma.usuario.findMany();
				if (user) {
					await prisma.usuario.deleteMany();
				}

				// biome-ignore lint/suspicious/noExplicitAny: <explanation>
				const promise = jsonData.map(async (response: any) => {
					if (response.D !== "Nome:") {
						await prisma.usuario.upsert({
							where: { cpf: response.E.toString() },
							create: {
								nome: response.D.toString(),
								cpf: await encrypt(response.E.toString()),
								telefone: response.G.toString(),
								email: await encrypt(response.F.toString()),
								avaliador: true,
							},
							update: {
								nome: response.D.toString(),
								telefone: response.G.toString(),
								email: await encrypt(response.F.toString()),
							},
						});
					}
				});

				await Promise.all(promise);

				return reply.status(201).send({
					message: "created successfully",
				});

				// biome-ignore lint/suspicious/noExplicitAny: <explanation>
			} catch (err: any) {
				return reply.status(403).send({
					message: err.message,
					statusCode: 403,
				});
			}
		}
	});
}
