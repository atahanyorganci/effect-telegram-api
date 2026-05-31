/**
 * Builds a multipart {@link FormData} payload for Telegram file-upload methods.
 * @param payload - The payload to convert to a {@link FormData} object.
 * @returns A {@link FormData} object.
 */
export const toFormData = (payload: Record<string, unknown> | FormData): FormData => {
	if (payload instanceof FormData) {
		return payload;
	}
	const form = new FormData();
	for (const [key, value] of Object.entries(payload)) {
		if (value === undefined) {
			continue;
		} else if (value instanceof FormData) {
			for (const [nestedKey, nestedValue] of value.entries()) {
				form.append(nestedKey, nestedValue);
			}
		} else if (value instanceof Blob) {
			form.append(key, value);
		} else if (value instanceof Uint8Array) {
			form.append(key, new Blob([value as BlobPart]), `${key}.bin`);
		} else if (typeof value === "object" && value !== null) {
			// Telegram expects JSON-serialized strings for nested params (reply_markup, media, etc.).
			// File fields must be string, Blob, or Uint8Array — not plain objects.
			form.append(key, JSON.stringify(value));
		} else if (
			typeof value === "string" ||
			typeof value === "number" ||
			typeof value === "boolean" ||
			typeof value === "bigint"
		) {
			form.append(key, String(value));
		} else {
			form.append(key, JSON.stringify(value));
		}
	}
	return form;
};
