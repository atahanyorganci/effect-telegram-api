import { Crypto, Data, Effect, Encoding, Option, Schema, SchemaIssue, SchemaTransformation } from "effect";

export const HashFunction = Schema.Literals(["md5", "sha1", "sha256", "sha512"]);
export type HashFunction = Schema.Schema.Type<typeof HashFunction>;

export const Hash = Schema.Struct({
	fn: HashFunction,
	value: Schema.String,
});
export type Hash = Schema.Schema.Type<typeof Hash>;

export type HashString = `${HashFunction}-${string}`;

export const HashFromString = Schema.String.pipe(
	Schema.decodeTo(
		Hash,
		SchemaTransformation.transformOrFail({
			decode: s => {
				const index = s.indexOf("-");
				if (index <= 0 || index === s.length - 1) {
					return Effect.fail(
						new SchemaIssue.InvalidValue(Option.some(s), {
							message: 'Expected "<hash-function>-<hash-value>"',
						}),
					);
				}

				const fn = s.slice(0, index);
				const value = s.slice(index + 1);

				if (!Schema.is(HashFunction)(fn)) {
					return Effect.fail(
						new SchemaIssue.InvalidValue(Option.some(s), {
							message: "Expected hash function md5, sha1, sha256, or sha512",
						}),
					);
				}

				return Effect.succeed({ fn, value });
			},
			encode: ({ fn, value }) => Effect.succeed(`${fn}-${value}`),
		}),
	),
);

export class UnsupportedHashFunction extends Data.TaggedError("UnsupportedHashFunction")<{
	readonly fn: HashFunction;
}> {}

export class HashMismatch extends Data.TaggedError("HashMismatch")<{
	readonly path: string;
	readonly expected: HashString;
	readonly actual: HashString;
}> {}

const toDigestAlgorithm = (fn: HashFunction): Crypto.DigestAlgorithm | undefined => {
	switch (fn) {
		case "sha1":
			return "SHA-1";
		case "sha256":
			return "SHA-256";
		case "sha512":
			return "SHA-512";
		default:
			return undefined;
	}
};

export const digestToHashString = (fn: HashFunction, bytes: Uint8Array): HashString =>
	`${fn}-${Encoding.encodeHex(bytes)}` as HashString;

export const computeHash = Effect.fn("computeHash")(function* (fn: HashFunction, data: Uint8Array) {
	const algorithm = toDigestAlgorithm(fn);
	if (algorithm === undefined) {
		return yield* Effect.fail(new UnsupportedHashFunction({ fn }));
	}

	const crypto = yield* Crypto.Crypto;
	const digest = yield* crypto.digest(algorithm, data);

	return digestToHashString(fn, digest);
});

export const verifyHash = Effect.fn("verifyHash")(function* (data: Uint8Array, expected: HashString, path: string) {
	const { fn } = yield* Schema.decodeEffect(HashFromString)(expected);
	const actual = yield* computeHash(fn, data);

	if (actual !== expected) {
		return yield* Effect.fail(new HashMismatch({ path, expected, actual }));
	}
});
