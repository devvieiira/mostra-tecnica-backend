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
import type { UserJWTPayload } from "src/utils/types";

export async function ImportTrabalho(app: FastifyInstance) {
	app.register(fastifyMultipart);
	app.post("/trabalho/import", async (req, reply) => {
		const data = await req.file();
		if (!data) {
			return reply.status(404).send({
				message: "File not provided",
			});
		}

		const extension = path.extname(data.filename);
		if (extension !== ".xlsx") {
			return reply.status(400).send({
				message: "File must be xlsx",
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

			const formatCpf = (cpf: string) => {
				const entrada = cpf.replace(/\D+/g, "");
				const saida = entrada.replace(
					/^(\d{3})(\d{3})(\d{3})(\d{2})$/,
					"$1.$2.$3-$4",
				);
				return saida;
			};

			const formatTelefone = (telefone: string) => {
				const entrada = telefone.replace(/\D+/g, "");
				return entrada;
			};

			try {
				// biome-ignore lint/suspicious/noExplicitAny: <explanation>
				const promise = jsonData.map(async (response: any, index) => {
					if (index !== 0) {
						const nome = response.D.toString();
						const existingAuthor = await prisma.usuario.findFirst({
							where: {
								nome: nome,
							},
						});

						// biome-ignore lint/suspicious/noImplicitAnyLet: <explanation>
						let authorId;


						if (!existingAuthor) {
							const newAuthor = await prisma.usuario.create({
								data: {
									nome: response.D ? response.D.toString() : "",
									cpf: response.E
										? await encrypt(formatCpf(response.E.toString()))
										: "",
									email: response.F ? await encrypt(response.F.toString()) : "",
									telefone: response.G
										? formatTelefone(response.G.toString())
										: "",
									formacao: response.I ? response.I.toString() : "",
									role: "NORMAL",
								},
							});

							authorId = newAuthor.id;
						} else {
							authorId = existingAuthor.id;
						}

						await prisma.trabalho.create({
							data: {
								carimbo: response.A ? response.A.toString() : "",
								instituicao: response.H
									? await encrypt(response.H.toString())
									: "",
								nivel_ensino: response.I
									? await encrypt(response.I.toString())
									: "",
								titulo_trabalho: response.AZ
									? await encrypt(response.AZ.toString())
									: "",
								modalidade: response.AY ? response.AY.toString() : "",
								area:
									response.BC !== undefined
										? response.BC
										: response.BD === undefined
											? ""
											: response.BD,
								autores: {
									connect: {
										id: authorId,
									},
								},
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
					error: err,
				});
			}
		}
	});
}
