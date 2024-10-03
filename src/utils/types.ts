import type { JWT } from "@fastify/jwt";
import { resolve } from "node:path";

declare module "fastify" {
	interface FastifyRequest {
		jwt: JWT;
	}
}

type UserJWTPayload = {
	id: string;
	email: string;
	name: string;
};

interface Fields {
	[key: string]: Field | Fields;
}

interface Field {
	type: "field";
	fieldname: string;
	mimetype: string;
	encoding: string;
	value: string;
	fieldnameTruncated: boolean;
	valueTruncated: boolean;
	fields?: Fields;
}

export type { UserJWTPayload, Field, Fields };
