import { assert, describe } from "@effect/vitest";
import * as Effect from "effect/Effect";
import { authErrorTests, callClient, expectClientSchemaError, liveTests, telegramConfig } from "./helpers.ts";

const callSendLocation = (token: string, payload: unknown) => callClient("sendLocation", token, payload as never);

liveTests("sendLocation", test => {
	describe("success", () => {
		test.effect("returns the sent location message", () =>
			Effect.gen(function* () {
				const { botToken, chatId } = yield* telegramConfig;
				const message = yield* callSendLocation(botToken, {
					chat_id: chatId,
					latitude: 41.0082,
					longitude: 28.9784,
				});

				assert.strictEqual(typeof message.message_id, "number");
				assert.strictEqual(typeof message.location?.latitude, "number");
				assert.strictEqual(typeof message.location?.longitude, "number");
			}),
		);
	});

	describe("Telegram API errors", () => {
		test.effect("ChatIdEmpty when chat_id is missing", () =>
			Effect.gen(function* () {
				const { botToken } = yield* telegramConfig;
				yield* expectClientSchemaError(callSendLocation(botToken, {}));
			}),
		);

		test.effect("LatitudeEmpty when latitude is missing", () =>
			Effect.gen(function* () {
				const { botToken, chatId } = yield* telegramConfig;
				yield* expectClientSchemaError(
					callSendLocation(botToken, {
						chat_id: chatId,
						longitude: 29.0,
					}),
				);
			}),
		);
	});

	authErrorTests(test, token => callSendLocation(token, { chat_id: 1, latitude: 41.0, longitude: 29.0 }));
});
