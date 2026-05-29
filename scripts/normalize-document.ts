import { sanitizeDocumentHtml } from "./sanitize-document.ts";

const generatedAtComment = /<!-- page generated in [\d.]+ms -->\n?$/u;

const decode = (bytes: Uint8Array): string => new TextDecoder().decode(bytes);

export const prepareRawDocument = (bytes: Uint8Array): Uint8Array =>
	new TextEncoder().encode(decode(bytes).replace(generatedAtComment, ""));

export const sanitizeDocument = (bytes: Uint8Array): Uint8Array =>
	new TextEncoder().encode(sanitizeDocumentHtml(decode(bytes)));
