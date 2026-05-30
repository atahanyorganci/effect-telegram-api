import { describe, it } from "@effect/vitest";
import * as Effect from "effect/Effect";
import * as Telegram from "../src/index.ts";
import { authErrorTests, expectErrorTag, LiveLayer, telegramConfig } from "./helpers.ts";

const callSetChatTitle = (token: string, payload: unknown) =>
	Telegram.Client.callMethod(token, Telegram.Methods.setChatTitle, payload);

describe("setChatTitle", () => {
	describe("Telegram API errors", () => {
		it.effect("TitleEmpty when title is missing", () =>
			Effect.gen(function* () {
				const { botToken, chatId } = yield* telegramConfig;
				const error = yield* callSetChatTitle(botToken, { chat_id: chatId }).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.TitleEmpty>(error, "TitleEmpty", "Bad Request: title must be non-empty");
			}).pipe(Effect.provide(LiveLayer)),
		);
	});

	authErrorTests(token => callSetChatTitle(token, { chat_id: 1 }));
});
