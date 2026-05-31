import { assert, describe } from "@effect/vitest";
import * as Effect from "effect/Effect";
import { authErrorTests, callClient, expectClientSchemaError, liveTests, telegramConfig } from "./helpers.ts";

const callSendContact = (token: string, payload: unknown) => callClient("sendContact", token, payload as never);

liveTests("sendContact", test => {
	describe("success", () => {
		test.effect.skip("returns the sent contact message", () =>
			Effect.gen(function* () {
				const { botToken, chatId } = yield* telegramConfig;
				const message = yield* callSendContact(botToken, {
					chat_id: chatId,
					phone_number: "+10000000000",
					first_name: "Test",
				});

				assert.strictEqual(typeof message.message_id, "number");
				assert.strictEqual(typeof message.contact?.phone_number, "string");
				assert.strictEqual(message.contact?.first_name, "Test");
			}),
		);
	});

	describe("Telegram API errors", () => {
		test.effect("PhoneNumberRequired when phone_number is missing", () =>
			Effect.gen(function* () {
				const { botToken, chatId } = yield* telegramConfig;
				yield* expectClientSchemaError(
					callSendContact(botToken, {
						chat_id: chatId,
						first_name: "Test",
					}),
				);
			}),
		);

		test.effect("FirstNameRequired when first_name is missing", () =>
			Effect.gen(function* () {
				const { botToken, chatId } = yield* telegramConfig;
				yield* expectClientSchemaError(
					callSendContact(botToken, {
						chat_id: chatId,
						phone_number: "+10000000000",
					}),
				);
			}),
		);
	});

	authErrorTests(test, token =>
		callSendContact(token, { chat_id: 1, phone_number: "+10000000000", first_name: "Test" }),
	);
});
