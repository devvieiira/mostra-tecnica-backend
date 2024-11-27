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

interface ResData {
  D: string; // Nome
  E: string; // CPF
  F: string; // Email
  G: string; // Telefone
  I?: string; // Formação
  K?: string; // Interesse
  L?: string; // Disponibilidade
}

export async function ImportAvaliador(app: FastifyInstance) {
  app.register(fastifyMultipart);

  app.post("/avaliador/import", async (req, reply) => {
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

    for (let i = 0; i < sheetNames.length; i++) {
      const worksheet = workbook.Sheets[sheetNames[i]];
      const jsonData = XLSX.utils.sheet_to_json<ResData>(worksheet, { header: "A" });

      const formatCpf = (cpf: string) => {
        const entrada = cpf.replace(/\D+/g, "");
        const saida = entrada.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, "$1.$2.$3-$4");
        return saida;
      };

      const formatTelefone = (telefone: string) => {
        const entrada = telefone.replace(/\D+/g, "");
        return entrada;
      };

      const cpfsUnicos = Array.from(new Set(jsonData.map((response) => response.E?.toString())));

      try {
        await prisma.usuario.deleteMany({
          where: {
            role: "AVALIADOR",
          },
        });

        // Processa apenas registros com CPFs únicos
        const promise = cpfsUnicos.map(async (cpfUnico) => {
          const response = jsonData.find((item) => item.E?.toString() === cpfUnico);

          if (response && response.D !== "Nome:") {
            await prisma.usuario.upsert({
              where: { cpf: formatCpf(response.E.toString()) },
              create: {
                nome: response.D.toString(),
                cpf: formatCpf(response.E.toString()),
                telefone: formatTelefone(response.G.toString()),
                email: await encrypt(response.F.toString()),
                role: "AVALIADOR",
                formacao: response.I?.toString() || "",
                interesse: response.K?.toString() || "",
                disponilidade: response.L?.toString() || "",
              },
              update: {
                nome: response.D.toString(),
                telefone: formatTelefone(response.G.toString()),
                email: await encrypt(response.F.toString()),
              },
            });
          }
        });

        await Promise.all(promise);

        return reply.status(201).send({
          message: "created successfully",
        });
      } catch (err: any) {
        return reply.status(403).send({
          message: err.message,
          statusCode: 403,
        });
      }
    }
  });
}
