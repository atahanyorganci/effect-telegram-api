import { describe } from "@effect/vitest";
import * as Effect from "effect/Effect";
import {
	authErrorTests,
	callClient,
	expectClientSchemaError,
	expectErrorTag,
	liveTests,
	telegramConfig,
} from "./helpers.ts";

const callSetChatStickerSet = (token: string, payload: unknown) =>
	callClient("setChatStickerSet", token, payload as never);

liveTests("setChatStickerSet", test => {
	describe("Telegram API errors", () => {
		test.effect("StickerSetNameEmpty when sticker_set_name is empty", () =>
			Effect.gen(function* () {
				const { botToken, groupId } = yield* telegramConfig;
				const error = yield* callSetChatStickerSet(botToken, {
					chat_id: groupId,
					sticker_set_name: "",
				}).pipe(Effect.flip);

				expectErrorTag(error, "StickerSetNameEmpty", "Bad Request: sticker_set_name is empty");
			}),
		);

		test.effect("StickerSetNotFound when sticker_set_name does not exist", () =>
			Effect.gen(function* () {
				const { botToken, groupId } = yield* telegramConfig;
				const error = yield* callSetChatStickerSet(botToken, {
					chat_id: groupId,
					sticker_set_name: "InvalidSetName_xyz",
				}).pipe(Effect.flip);

				expectErrorTag(error, "StickerSetNotFound", "Bad Request: sticker set not found");
			}),
		);

		test.effect("ChatIdEmpty when required parameters missing", () =>
			Effect.gen(function* () {
				const { botToken } = yield* telegramConfig;
				yield* expectClientSchemaError(callSetChatStickerSet(botToken, {}));
			}),
		);
	});

	authErrorTests(test, token => callSetChatStickerSet(token, { chat_id: 0, sticker_set_name: "invalid" }));
});
