// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export function parseBody(objeto: any): Record<string, any> {
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	const values: Record<string, any> = {};

	for (const key in objeto) {
		const field = objeto[key];

		if (Array.isArray(field)) {
			// biome-ignore lint/suspicious/noExplicitAny: <explanation>
			values[field[0].fieldname] = field.map((item: any) => item.value);
		}

		if (field.type === "field") {
			values[field.fieldname] = field.value;
		}
	}

	return values;
}
