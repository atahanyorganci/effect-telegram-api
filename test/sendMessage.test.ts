import { assert, describe, it } from "@effect/vitest";
import * as Effect from "effect/Effect";
import * as Telegram from "../src/index.ts";
import { expectErrorTag, LiveLayer, requireBotToken, requireChatId } from "./helpers.ts";

const callSendMessage = (token: string, payload: unknown) =>
	Telegram.Client.callMethod(token, Telegram.Methods.sendMessage, payload);

describe("sendMessage", () => {
	describe("success", () => {
		it.effect("sends a message when chat_id and text are valid", () =>
			Effect.gen(function* () {
				const message = yield* callSendMessage(requireBotToken(), {
					chat_id: requireChatId(),
					text: "telegram-api test",
				});

				assert.strictEqual(typeof message.message_id, "number");
				assert.strictEqual(message.text, "telegram-api test");
			}).pipe(Effect.provide(LiveLayer)),
		);
	});

	describe("Telegram API errors", () => {
		it.effect("MessageTextEmpty when text is missing", () =>
			Effect.gen(function* () {
				const error = yield* callSendMessage(requireBotToken(), { chat_id: 0 }).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.MessageTextEmpty>(
					error,
					"MessageTextEmpty",
					"Bad Request: message text is empty",
				);
			}).pipe(Effect.provide(LiveLayer)),
		);
	});
});
