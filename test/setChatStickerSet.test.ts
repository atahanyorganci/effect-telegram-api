import { describe, it } from "@effect/vitest";
import * as Effect from "effect/Effect";
import * as Telegram from "../src/index.ts";
import { authErrorTests, expectErrorTag, LiveLayer, telegramConfig } from "./helpers.ts";

const callSetChatStickerSet = (token: string, payload: unknown) =>
	Telegram.Client.callMethod(token, Telegram.Methods.setChatStickerSet, payload);

describe("setChatStickerSet", () => {
	describe("Telegram API errors", () => {
		it.effect("StickerSetNameEmpty when sticker_set_name is empty", () =>
			Effect.gen(function* () {
				const { botToken, groupId } = yield* telegramConfig;
				const error = yield* callSetChatStickerSet(botToken, {
					chat_id: groupId,
					sticker_set_name: "",
				}).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.StickerSetNameEmpty>(
					error,
					"StickerSetNameEmpty",
					"Bad Request: sticker_set_name is empty",
				);
			}).pipe(Effect.provide(LiveLayer)),
		);

		it.effect("StickerSetNotFound when sticker_set_name does not exist", () =>
			Effect.gen(function* () {
				const { botToken, groupId } = yield* telegramConfig;
				const error = yield* callSetChatStickerSet(botToken, {
					chat_id: groupId,
					sticker_set_name: "InvalidSetName_xyz",
				}).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.StickerSetNotFound>(
					error,
					"StickerSetNotFound",
					"Bad Request: sticker set not found",
				);
			}).pipe(Effect.provide(LiveLayer)),
		);

		it.effect("ChatIdEmpty when required parameters missing", () =>
			Effect.gen(function* () {
				const { botToken } = yield* telegramConfig;
				const error = yield* callSetChatStickerSet(botToken, {}).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.ChatIdEmpty>(error, "ChatIdEmpty", "Bad Request: chat_id is empty");
			}).pipe(Effect.provide(LiveLayer)),
		);
	});

	authErrorTests(token => callSetChatStickerSet(token, { chat_id: 0, sticker_set_name: "invalid" }));
});
