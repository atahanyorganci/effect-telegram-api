import { assert, describe, it } from "@effect/vitest";
import * as Effect from "effect/Effect";
import * as Telegram from "../src/index.ts";
import { authErrorTests, expectErrorTag, LiveLayer, requireBotToken, requireChatId } from "./helpers.ts";

const callSendDice = (token: string, payload: unknown) =>
	Telegram.Client.callMethod(token, Telegram.Methods.sendDice, payload);

describe("sendDice", () => {
	describe("success", () => {
		it.effect("returns the sent dice message", () =>
			Effect.gen(function* () {
				const message = yield* callSendDice(requireBotToken(), { chat_id: requireChatId() });

				assert.strictEqual(typeof message.message_id, "number");
				assert.strictEqual(typeof message.dice?.value, "number");
			}).pipe(Effect.provide(LiveLayer)),
		);
	});

	describe("Telegram API errors", () => {
		it.effect("ChatNotFound when chat_id does not exist", () =>
			Effect.gen(function* () {
				const error = yield* callSendDice(requireBotToken(), { chat_id: 0 }).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.ChatNotFound>(error, "ChatNotFound", "Bad Request: chat not found");
			}).pipe(Effect.provide(LiveLayer)),
		);

		it.effect("ChatIdEmpty when chat_id is missing", () =>
			Effect.gen(function* () {
				const error = yield* callSendDice(requireBotToken(), {}).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.ChatIdEmpty>(error, "ChatIdEmpty", "Bad Request: chat_id is empty");
			}).pipe(Effect.provide(LiveLayer)),
		);
	});

	authErrorTests(token => callSendDice(token, { chat_id: 1 }));
});
