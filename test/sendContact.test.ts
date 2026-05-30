import { assert, describe, it } from "@effect/vitest";
import * as Effect from "effect/Effect";
import * as Telegram from "../src/index.ts";
import { authErrorTests, expectErrorTag, LiveLayer, requireBotToken, requireChatId } from "./helpers.ts";

const callSendContact = (token: string, payload: unknown) =>
	Telegram.Client.callMethod(token, Telegram.Methods.sendContact, payload);

describe("sendContact", () => {
	describe("success", () => {
		it.effect("returns the sent contact message", () =>
			Effect.gen(function* () {
				const message = yield* callSendContact(requireBotToken(), {
					chat_id: requireChatId(),
					phone_number: "+10000000000",
					first_name: "Test",
				});

				assert.strictEqual(typeof message.message_id, "number");
				assert.strictEqual(typeof message.contact?.phone_number, "string");
				assert.strictEqual(message.contact?.first_name, "Test");
			}).pipe(Effect.provide(LiveLayer)),
		);
	});

	describe("Telegram API errors", () => {
		it.effect("PhoneNumberRequired when phone_number is missing", () =>
			Effect.gen(function* () {
				const error = yield* callSendContact(requireBotToken(), {
					chat_id: requireChatId(),
					first_name: "Test",
				}).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.PhoneNumberRequired>(
					error,
					"PhoneNumberRequired",
					'Bad Request: parameter "phone_number" is required',
				);
			}).pipe(Effect.provide(LiveLayer)),
		);

		it.effect("FirstNameRequired when first_name is missing", () =>
			Effect.gen(function* () {
				const error = yield* callSendContact(requireBotToken(), {
					chat_id: requireChatId(),
					phone_number: "+10000000000",
				}).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.FirstNameRequired>(
					error,
					"FirstNameRequired",
					'Bad Request: parameter "first_name" is required',
				);
			}).pipe(Effect.provide(LiveLayer)),
		);
	});

	authErrorTests(token => callSendContact(token, { chat_id: 1, phone_number: "+10000000000", first_name: "Test" }));
});
