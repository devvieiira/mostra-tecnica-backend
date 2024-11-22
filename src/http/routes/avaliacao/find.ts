import type { FastifyInstance } from "fastify";
import { decrypt } from "src/lib/crypto";
import { prisma } from "src/lib/prisma";
import type { UserJWTPayload } from "src/utils/types";

export async function getAllVotedTrabalhos(app: FastifyInstance) {
  app.get("/trabalhos-votados", async (req, reply) => {
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
      const trabalhosVotados = await prisma.avaliacao.findMany({
        select: {
          usuarioId: true,
          nota: true,
          inclusao: true, // Vamos garantir que o campo `inclusao` é retornado
          trabalhos: {
            select: {
              id: true,
              titulo_trabalho: true,
              instituicao: true,
              area: true,
              autores: { select: { id: true, nome: true, role: true } },
            },
          },
          usuario: { select: { nome: true, email: true } },
        },
        orderBy: { nota: "desc" },
      });

      const trabalhosAgrupados = new Map<string, any>();

      for (const voto of trabalhosVotados) {
        const trabalhoId = voto.trabalhos.id;

        const instituicao = await decrypt(voto.trabalhos.instituicao);
        const titulo_trabalho = await decrypt(voto.trabalhos.titulo_trabalho);

        if (!trabalhosAgrupados.has(trabalhoId)) {
          // Inicializa o objeto se não existir
          trabalhosAgrupados.set(trabalhoId, {
            trabalhoId,
            titulo_trabalho,
            instituicao,
            areaTrabalho: voto.trabalhos.area,
            autores: voto.trabalhos.autores.map((autor) => ({
              id: autor.id,
              nome: autor.nome,
              role: autor.role,
              votou: false, // Inicializa como false
            })),
            notas: [],
            votos: [],
            inclusao: false, // Inicializa o campo inclusao como `false`
          });
        }

        const trabalhoExistente = trabalhosAgrupados.get(trabalhoId);

        // Adiciona a nota e o voto atual
        trabalhoExistente.notas.push(voto.nota);
        trabalhoExistente.votos.push({ usuarioId: voto.usuarioId });

        // Verifica o campo `inclusao` e ajusta o valor se for true
        if (voto.inclusao) {
          trabalhoExistente.inclusao = true;
        }

        // Atualiza o campo `votou` para cada autor, se o autor já recebeu um voto
        trabalhoExistente.autores = trabalhoExistente.autores.map((autor: { id: any; }) => ({
          ...autor,
          votou: trabalhoExistente.votos.some((v: { usuarioId: any; }) => v.usuarioId === autor.id),
        }));
      }

      const trabalhosComNotas = Array.from(trabalhosAgrupados.values()).map((trabalho) => {
        const somaNotas = trabalho.notas.reduce((acc: number, nota: number) => acc + nota, 0);
        const notaTotal = somaNotas / trabalho.notas.length;

        return {
          trabalhoId: trabalho.trabalhoId,
          titulo_trabalho: trabalho.titulo_trabalho,
          instituicao: trabalho.instituicao,
          areaTrabalho: trabalho.areaTrabalho,
          autores: trabalho.autores,
          notas: trabalho.notas,
          notaTotal: notaTotal.toFixed(2),
          inclusao: trabalho.inclusao, // Retorna o valor de inclusao (true/false)
        };
      });

      return reply.status(200).send({ data: trabalhosComNotas });
    } catch (error) {
      return reply.status(500).send({ message: "An error occurred", error });
    }
  });
}
