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

const callDeleteChatStickerSet = (token: string, payload: unknown) =>
	callClient("deleteChatStickerSet", token, payload as never);

liveTests("deleteChatStickerSet", test => {
	describe("Telegram API errors", () => {
		test.effect("CantSetSupergroupStickerSet when the bot cannot change the group sticker set", () =>
			Effect.gen(function* () {
				const { limitedBotToken, groupId } = yield* telegramConfig;
				const error = yield* callDeleteChatStickerSet(limitedBotToken, { chat_id: groupId }).pipe(Effect.flip);

				expectErrorTag(error, "BadRequest", "Bad Request: not enough rights to change supergroup sticker set");
			}),
		);

		test.effect("ChatIdEmpty when required parameters missing", () =>
			Effect.gen(function* () {
				const { botToken } = yield* telegramConfig;
				yield* expectClientSchemaError(callDeleteChatStickerSet(botToken, {}));
			}),
		);
	});

	authErrorTests(test, token => callDeleteChatStickerSet(token, { chat_id: 0 }));
});
