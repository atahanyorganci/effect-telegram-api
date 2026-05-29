const generatedAtComment = /<!-- page generated in [\d.]+ms -->\n?$/u;

export const normalizeDocument = (bytes: Uint8Array): Uint8Array => {
	const text = new TextDecoder().decode(bytes);
	const normalized = text.replace(generatedAtComment, "");

	return new TextEncoder().encode(normalized);
};
