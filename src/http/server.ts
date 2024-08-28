import fastify from "fastify";
import cors from "@fastify/cors";
import { ImportAvaliador } from "./routes/avaliador/create";
import { getAvaliadores } from "./routes/avaliador/find";
import { deleteAvaliador } from "./routes/avaliador/delete";
import { ImportTrabalho } from "./routes/trabalho/create";
import { getTrabalho } from "./routes/trabalho/find";
import { deleteTrabalho } from "./routes/trabalho/delete";
// import multer from "fastify-multer";
// import { ReadFile } from "./routes/avaliador/readFile";

const app = fastify();

app.register(cors, {
	origin: process.env.FRONTEND_URL || "*",
	credentials: true,
});

// app.register(multer.contentParser);

// app.register(ReadFile);

//AVALIADORES

app.register(ImportAvaliador);
app.register(getAvaliadores);
app.register(deleteAvaliador);

//TRABALHOS
app.register(ImportTrabalho);
app.register(getTrabalho);
app.register(deleteTrabalho);

app.listen({ port: 4000, host: "0.0.0.0" }).then((value) => {
	console.log("HTTP Server Running!", value);
});
