const requiresNoParameters = /\s*Requires no parameters\.?\s*/i;
const returnsClause = /\s*Returns\b[^.]*\.\s*$/i;
const returnedClause = /\s*On success,[^.]*\.\s*$/i;

export const parseMethodDescription = (text: string): string => {
	const requiresIndex = text.search(requiresNoParameters);
	const returnsIndex = text.search(/\bReturns\b/i);
	const returnedIndex = text.search(/\bis returned\b/i);
	const cutAt = Math.min(
		requiresIndex >= 0 ? requiresIndex : Number.POSITIVE_INFINITY,
		returnsIndex >= 0 ? returnsIndex : Number.POSITIVE_INFINITY,
		returnedIndex >= 0 ? returnedIndex : Number.POSITIVE_INFINITY,
	);

	if (cutAt === Number.POSITIVE_INFINITY) {
		return text.trim();
	}

	return text
		.slice(0, cutAt)
		.trim()
		.replace(/\.\s*$/, "");
};

export const methodProseBeforeTable = (paragraphs: readonly { readonly text: string }[]): string => {
	const parts: string[] = [];

	for (const paragraph of paragraphs) {
		const text = paragraph.text.trim();
		if (text.length === 0) {
			continue;
		}

		parts.push(text);

		if (requiresNoParameters.test(text) || returnsClause.test(text) || returnedClause.test(text)) {
			break;
		}
	}

	return parts.join(" ");
};
