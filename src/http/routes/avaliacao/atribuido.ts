import type { FastifyInstance } from "fastify";
import { decrypt } from "src/lib/crypto";
import { prisma } from "src/lib/prisma";
import type { UserJWTPayload } from "src/utils/types";

interface RouteParams {
  idUser: string;
}

export async function getTrabalhosComStatusDeAvaliacao(app: FastifyInstance) {
  app.get<{ Params: RouteParams }>("/trabalhos-usuario/:idUser", async (req, reply) => {
    const { idUser } = req.params;
    let userJWTData: UserJWTPayload | null = null;

    try {
      const authorization = req.headers.authorization;
      const access_token = authorization?.split("Bearer ")[1];
      userJWTData = app.jwt.decode(access_token as string);
    } catch (error) {
      return reply.status(403).send({ message: "Token missing" });
    }

    const loggedUser = await prisma.usuario.findUnique({
      where: { id: userJWTData?.id },
    });

    if (loggedUser?.role !== "AVALIADOR" && loggedUser?.role !== "ADMIN") {
      return reply.status(401).send({ message: "Unauthorized" });
    }

    try {
      const trabalhos = await prisma.trabalho.findMany({
        where: {
          autores: {
            some: { id: idUser },
          },
        },
        select: {
          id: true,
          titulo_trabalho: true,
          instituicao: true,
          area: true,
          autores: { select: { id: true, nome: true, role: true } },
          nivel_ensino: true,
        },
      });


      const avaliacoes = await prisma.avaliacao.findMany({
        where: {
          trabalhoId: { in: trabalhos.map((t) => t.id) },
        },
        select: { trabalhoId: true, usuarioId: true },
      });

      const trabalhosComStatus = await Promise.all(
        trabalhos.map(async (trabalho) => {
          const titulo_trabalho = await decrypt(trabalho.titulo_trabalho);
          const instituicao = await decrypt(trabalho.instituicao);
          const nivel_ensino = await decrypt(trabalho.nivel_ensino)

          const avaliado = avaliacoes.some(
            (avaliacao) =>
              avaliacao.trabalhoId === trabalho.id && avaliacao.usuarioId === idUser
          );


          return {
            trabalhoId: trabalho.id,
            titulo_trabalho,
            instituicao,
            areaTrabalho: trabalho.area,
            autores: trabalho.autores,
            avaliado, 
            nivel_ensino,
          };
        })
      );

      return reply.status(200).send({ data: trabalhosComStatus });
    } catch (error) {
      return reply.status(500).send({
        message: "An error occurred",
        error,
      });
    }
  });
}
