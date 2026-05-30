import { assert, describe, it } from "@effect/vitest";
import * as Effect from "effect/Effect";
import * as Telegram from "../src/index.ts";
import { authErrorTests, expectErrorTag, LiveLayer, requireBotToken } from "./helpers.ts";

const callGetFile = (token: string, payload: unknown) =>
	Telegram.Client.callMethod(token, Telegram.Methods.getFile, payload);

describe("getFile", () => {
	describe("success", () => {
		it.effect("returns file metadata for a sticker thumbnail file_id", () =>
			Effect.gen(function* () {
				const token = requireBotToken();
				const stickers = yield* Telegram.Client.callMethod(token, Telegram.Methods.getForumTopicIconStickers);
				const first = stickers[0] as { readonly thumbnail?: { readonly file_id?: string } } | undefined;
				const fileId = first?.thumbnail?.file_id;
				if (fileId === undefined) {
					assert.fail("getForumTopicIconStickers returned no thumbnail file_id");
				}

				const file = yield* callGetFile(token, { file_id: fileId });

				assert.strictEqual(typeof file.file_id, "string");
				assert.strictEqual(typeof file.file_unique_id, "string");
			}).pipe(Effect.provide(LiveLayer)),
		);
	});

	describe("Telegram API errors", () => {
		it.effect("InvalidFileId when file_id is not valid", () =>
			Effect.gen(function* () {
				const error = yield* callGetFile(requireBotToken(), { file_id: "invalid" }).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.InvalidFileId>(error, "InvalidFileId", "Bad Request: invalid file_id");
			}).pipe(Effect.provide(LiveLayer)),
		);

		it.effect("FileIdNotSpecified when file_id is missing", () =>
			Effect.gen(function* () {
				const error = yield* callGetFile(requireBotToken(), {}).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.FileIdNotSpecified>(
					error,
					"FileIdNotSpecified",
					"Bad Request: file_id not specified",
				);
			}).pipe(Effect.provide(LiveLayer)),
		);
	});

	authErrorTests(token => callGetFile(token, { file_id: "invalid" }));
});
