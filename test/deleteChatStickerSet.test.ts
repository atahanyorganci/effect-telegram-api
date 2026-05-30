import { describe, it } from "@effect/vitest";
import * as Effect from "effect/Effect";
import * as Telegram from "../src/index.ts";
import { authErrorTests, expectErrorTag, LiveLayer, telegramConfig } from "./helpers.ts";

const callDeleteChatStickerSet = (token: string, payload: unknown) =>
	Telegram.Client.callMethod(token, Telegram.Methods.deleteChatStickerSet, payload);

describe("deleteChatStickerSet", () => {
	describe("Telegram API errors", () => {
		it.effect("CantSetSupergroupStickerSet when the bot cannot change the group sticker set", () =>
			Effect.gen(function* () {
				const { botToken, groupId } = yield* telegramConfig;
				const error = yield* callDeleteChatStickerSet(botToken, { chat_id: groupId }).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.CantSetSupergroupStickerSet>(
					error,
					"CantSetSupergroupStickerSet",
					"Bad Request: can't set supergroup sticker set",
				);
			}).pipe(Effect.provide(LiveLayer)),
		);

		it.effect("ChatIdEmpty when required parameters missing", () =>
			Effect.gen(function* () {
				const { botToken } = yield* telegramConfig;
				const error = yield* callDeleteChatStickerSet(botToken, {}).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.ChatIdEmpty>(error, "ChatIdEmpty", "Bad Request: chat_id is empty");
			}).pipe(Effect.provide(LiveLayer)),
		);
	});

	authErrorTests(token => callDeleteChatStickerSet(token, { chat_id: 0 }));
});
