import {
	renderAnnotatedSchemaExpr,
	renderJsDoc,
	renderSchemaExpr,
	methodUsesMultipart,
	type RenderRefStrategy,
} from "./render-type-expr.ts";
import type { Method, Parameter } from "../parse/model.ts";

export const payloadSchemaStrategy: RenderRefStrategy = {
	schemaRef: name => `Objects.${name}`,
	fileSchema: () => "Objects.InputFile",
};

export const renderPayloadStructFields = (parameters: readonly Parameter[]): string =>
	parameters.map(parameter => renderPayloadField(parameter)).join("\n");

const renderPayloadField = (parameter: Parameter): string => {
	let expr = renderSchemaExpr(parameter.type, payloadSchemaStrategy);
	if (!parameter.required) {
		expr = `Schema.optional(${expr})`;
	}
	expr = renderAnnotatedSchemaExpr(expr, parameter.description);
	return `${renderJsDoc(parameter.description, "\t")}\t${parameter.name}: ${expr},`;
};

/** Payload struct used for {@link Schema.encodeUnknownEffect} before multipart conversion. */
export const renderPayloadEncodeSchemaExpr = (method: Method): string => {
	const fields = renderPayloadStructFields(method.parameters);
	const struct = `Schema.Struct({\n${fields}\n})`;
	const description = method.description.trim();
	if (description.length === 0) {
		return struct;
	}
	return `${struct}.pipe(\n\tSchema.annotate({ description: ${JSON.stringify(description)} }),\n)`;
};

export const renderPayloadEncodingPipe = (parameters: readonly Parameter[], description: string): string => {
	const encoding = methodUsesMultipart(parameters) ? "HttpApiSchema.asMultipart()" : "HttpApiSchema.asJson()";
	const text = description.trim();
	if (text.length === 0) {
		return `.pipe(Schema.toCodecJson, ${encoding})`;
	}
	return `.pipe(Schema.annotate({ description: ${JSON.stringify(text)} }), Schema.toCodecJson, ${encoding})`;
};

export const renderEndpointPayloadExpr = (method: Method): string => {
	const fields = renderPayloadStructFields(method.parameters);
	return `Schema.Struct({\n${fields}\n\t})${renderPayloadEncodingPipe(method.parameters, method.description)}`;
};

/** Inline payload encode schemas for multipart methods (used in {@link renderTelegramModule}). */
export const renderInlinedPayloadSchemas = (methods: readonly Method[]): string => {
	const multipart = methods.filter(method => method.parameters.length > 0 && methodUsesMultipart(method.parameters));
	if (multipart.length === 0) {
		return "";
	}

	const sorted = [...multipart].sort((a, b) => a.name.localeCompare(b.name));
	const schemas = sorted.map(method => `const ${method.name}Payload = ${renderPayloadEncodeSchemaExpr(method)};`);

	return [`/** Payload encode schemas for multipart Bot API methods. */`, ...schemas, ""].join("\n");
};
