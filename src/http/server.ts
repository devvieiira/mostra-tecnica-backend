import fjwt from "@fastify/jwt";
import { config } from "dotenv";
import fCookie from "@fastify/cookie";
import fastMultipart from "@fastify/multipart";
import fastify from "fastify";
import cors from "@fastify/cors";
import fstatic from "@fastify/static";
import path from "node:path";

// routes
import { signUp } from "./routes/auth/signUp";
import { signIn } from "./routes/auth/login";
import { CreateCandidate } from "./routes/candidate/create";
import { CreateGovernmentForm } from "./routes/government/create";
import {
	FindAllGovernmentForm,
	FindGovernmentFormId,
} from "./routes/government/findAll";
import { CreatePoliticalParty } from "./routes/politicalParty/create";
import {
	FindAllPoliticalParty,
	FindClassPoliticalParty,
	FindIdPoliticalParty,
} from "./routes/politicalParty/findAll";
import { createVoter } from "./routes/voter/create";
import { getAllVoters, getVoterId } from "./routes/voter/findAll";
import { EditCandidate } from "./routes/candidate/edit";
import {
	FindAllCandidates,
	FindCandidatesId,
} from "./routes/candidate/findAll";
import { EditGovernment } from "./routes/government/edit";
import { EditPoliticalParty } from "./routes/politicalParty/edit";
import { EditVoter } from "./routes/voter/edit";
import { DeleteCandidate } from "./routes/candidate/delete";
import { DeleteGovernment } from "./routes/government/delete";
import { DeletePoliticalParty } from "./routes/politicalParty/delete";
import { DeleteVoter } from "./routes/voter/delete";

const app = fastify();

config();
app.register(cors, {
	origin: process.env.FRONTEND_URL,
	credentials: true,
	allowedHeaders: ["Authorization"],
});

app.register(fjwt, {
	secret: "G83W89GASBRIHB$GKOAEQYHhU%Ugaibrei@gsb54abh5rba",
});
app.register(fastMultipart, {
	attachFieldsToBody: true,
});

app.addHook("preHandler", (req, res, next) => {
	req.jwt = app.jwt;
	return next();
});

app.register(fCookie, {
	secret: "some-secret-key",
	hook: "preHandler",
});
app.register(fstatic, {
	root: path.join(__dirname, "../../uploads"),
	prefix: "/public/",
});
// console.log(path.join(__dirname, "../../uploads"));

// routes

// auth
app.register(signUp);
app.register(signIn);
// =======================
// candidate
app.register(CreateCandidate);
app.register(EditCandidate);
app.register(FindAllCandidates);
app.register(FindCandidatesId);
app.register(DeleteCandidate);
// =======================
// government
app.register(CreateGovernmentForm);
app.register(FindAllGovernmentForm);
app.register(FindGovernmentFormId);
app.register(EditGovernment);
app.register(DeleteGovernment);
// =======================
// politicalPaty
app.register(CreatePoliticalParty);
app.register(FindClassPoliticalParty);
app.register(FindAllPoliticalParty);
app.register(FindIdPoliticalParty);
app.register(EditPoliticalParty);
app.register(DeletePoliticalParty);
// =======================
// voter
app.register(createVoter);
app.register(getAllVoters);
app.register(EditVoter);
app.register(DeleteVoter);
app.register(getVoterId);

app.listen({ port: 4000, host: "0.0.0.0" }).then((value) => {
	console.log("server running", value);
});
