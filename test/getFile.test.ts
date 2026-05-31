import { assert, describe } from "@effect/vitest";
import * as Effect from "effect/Effect";
import {
	authErrorTests,
	callClient,
	expectClientSchemaError,
	expectErrorTag,
	liveTests,
	telegramConfig,
} from "./helpers.ts";

const callGetFile = (token: string, payload: unknown) => callClient("getFile", token, payload as never);

liveTests("getFile", test => {
	describe("success", () => {
		test.effect("returns file metadata for a sticker thumbnail file_id", () =>
			Effect.gen(function* () {
				const { botToken: token } = yield* telegramConfig;
				const stickers = yield* callClient("getForumTopicIconStickers", token);
				const first = stickers[0] as { readonly thumbnail?: { readonly file_id?: string } } | undefined;
				const fileId = first?.thumbnail?.file_id;
				if (fileId === undefined) {
					assert.fail("getForumTopicIconStickers returned no thumbnail file_id");
				}

				const file = yield* callGetFile(token, { file_id: fileId });

				assert.strictEqual(typeof file.file_id, "string");
				assert.strictEqual(typeof file.file_unique_id, "string");
			}),
		);
	});

	describe("Telegram API errors", () => {
		test.effect("InvalidFileId when file_id is not valid", () =>
			Effect.gen(function* () {
				const { botToken } = yield* telegramConfig;
				const error = yield* callGetFile(botToken, { file_id: "invalid" }).pipe(Effect.flip);

				expectErrorTag(error, "InvalidFileId", "Bad Request: invalid file_id");
			}),
		);

		test.effect("FileIdNotSpecified when file_id is missing", () =>
			Effect.gen(function* () {
				const { botToken } = yield* telegramConfig;
				yield* expectClientSchemaError(callGetFile(botToken, {}));
			}),
		);
	});

	authErrorTests(test, token => callGetFile(token, { file_id: "invalid" }));
});
