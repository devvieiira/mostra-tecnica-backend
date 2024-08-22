import * as bcrypt from "bcrypt";
import cryptojs from "crypto-js";

const key = "FHOUWGAbgiuggvbyIGHhG";
export async function hashing(data: string) {
	const salt = await bcrypt.genSalt();
	return await bcrypt.hash(data, salt);
}

export async function compareHash(data: string, has: string) {
	return await bcrypt.compare(data, has);
}
export async function encrypt(data: string, keyOf: string = key) {
	const encrypted = cryptojs.AES.encrypt(data, key).toString();
	return encrypted;
}

export async function decrypt(encrypted: string) {
	const decrypted = cryptojs.AES.decrypt(encrypted, key).toString(
		cryptojs.enc.Utf8,
	);

	return decrypted;
}
