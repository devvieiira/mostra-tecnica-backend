import fjwt from "@fastify/jwt";
import { config } from "dotenv";
import fCookie from "@fastify/cookie";
import fastMultipart from "@fastify/multipart";
import fastify from "fastify";
import cors from "@fastify/cors";
import fstatic from "@fastify/static";
import path from "node:path";

// routes
import { signIn } from "./routes/auth/login/admin";

import fastifyMultipart from "@fastify/multipart";
import { ConnectWork } from "./routes/trabalho/connect-work";
import { ImportTrabalho } from "./routes/trabalho/create";
import { deleteTrabalho } from "./routes/trabalho/delete";
import { getOneTrabalho } from "./routes/trabalho/find-one";
import { getTrabalho } from "./routes/trabalho/find";
import { DisconnectWork } from "./routes/trabalho/remove-connect";
import { ImportAvaliador } from "./routes/avaliador/create";
import { deleteAvaliador } from "./routes/avaliador/delete";
import { getOneAvaliador } from "./routes/avaliador/find-one";
import { getAvaliadores } from "./routes/avaliador/find";
import { fileMiddleware } from "src/lib/middleware";
import { avaliadorSignIn } from "./routes/auth/login/avaliador";
import { getAllVotedTrabalhos } from "./routes/avaliacao/find";
import { avaliacao } from "./routes/avaliacao/trabalho";
import { signUp } from "./routes/auth/signUp";
import { getTrabalhosComStatusDeAvaliacao } from "./routes/avaliacao/atribuido";
import { getUniqueWork } from "./routes/trabalho/find-one-work";

const app = fastify();

config();

app.register(cors, {
	origin: process.env.FRONTEND_URL,
	credentials: true,
	allowedHeaders: ["Authorization", "Content-Type"],
	methods: ["GET", "PUT", "POST", "PATCH", "DELETE", "OPTIONS"],
	exposedHeaders: ["Authorization"],
});

app.register(fjwt, {
	secret: process.env.JWT_ASSIGN || "secret-key",
});

app.addHook("preHandler", (req, _, next) => {
	req.jwt = app.jwt;
	return next();
});

app.register(fCookie, {
	secret: process.env.COOKIE_SECRET,
	hook: "preHandler",
});

app.register(fstatic, {
	root: path.join(__dirname, "../../uploads"),
	prefix: "/public/",
});

// Rotas agrupadas com prefixo global "/api"
app.register(async (appInstance) => {
	// Rotas principais
	appInstance.get("/", () => "Hello World");

	// Auth
	appInstance.register(signUp);
	appInstance.register(signIn);
	appInstance.register(avaliadorSignIn);

	// Trabalhos
	appInstance.register(ConnectWork);
	appInstance.register(ImportTrabalho);
	appInstance.register(deleteTrabalho);
	appInstance.register(getOneTrabalho);
	appInstance.register(getTrabalho);
	appInstance.register(DisconnectWork);
	appInstance.register(getUniqueWork);
	appInstance.register(avaliacao);
	appInstance.register(getTrabalhosComStatusDeAvaliacao);

	// Avaliadores
	appInstance.register(ImportAvaliador);
	appInstance.register(deleteAvaliador);
	appInstance.register(getOneAvaliador);
	appInstance.register(getAvaliadores);
	appInstance.register(getAllVotedTrabalhos);
}, { prefix: "/api" }); // Adiciona o prefixo global "/api"

// Inicializa o servidor
app.listen({ port: 4000, host: "0.0.0.0" }).then((value) => {
	console.log("front-url", process.env.FRONTEND_URL);
	console.log("alteração surtiu efeito");
	console.log("server running", value);
})
