import { assert, describe } from "@effect/vitest";
import * as Effect from "effect/Effect";
import {
	authErrorTests,
	callClient,
	expectClientSchemaError,
	expectErrorTag,
	liveTests,
	telegramConfig,
} from "./helpers.ts";

const callSendVenue = (token: string, payload: unknown) => callClient("sendVenue", token, payload as never);

liveTests("sendVenue", test => {
	describe("success", () => {
		test.effect("returns the sent venue message", () =>
			Effect.gen(function* () {
				const { botToken, chatId } = yield* telegramConfig;
				const message = yield* callSendVenue(botToken, {
					chat_id: chatId,
					latitude: 41.0082,
					longitude: 28.9784,
					title: "Istanbul",
					address: "Turkey",
				});

				assert.strictEqual(typeof message.message_id, "number");
				assert.strictEqual(typeof message.venue?.location?.latitude, "number");
				assert.strictEqual(typeof message.venue?.location?.longitude, "number");
			}),
		);
	});

	describe("Telegram API errors", () => {
		test.effect("ChatIdEmpty when chat_id is missing", () =>
			Effect.gen(function* () {
				const { botToken } = yield* telegramConfig;
				yield* expectClientSchemaError(callSendVenue(botToken, {}));
			}),
		);

		test.effect("ChatNotFound when chat_id does not exist", () =>
			Effect.gen(function* () {
				const { botToken } = yield* telegramConfig;
				const error = yield* callSendVenue(botToken, {
					chat_id: 0,
					latitude: 41.0,
					longitude: 29.0,
					title: "Place",
					address: "Addr",
				}).pipe(Effect.flip);

				expectErrorTag(error, "BadRequest", "Bad Request: chat not found");
			}),
		);

		test.effect("LatitudeEmpty when latitude is missing", () =>
			Effect.gen(function* () {
				const { botToken, chatId } = yield* telegramConfig;
				yield* expectClientSchemaError(
					callSendVenue(botToken, {
						chat_id: chatId,
						longitude: 29.0,
						title: "Place",
						address: "Addr",
					}),
				);
			}),
		);

		test.effect("LongitudeEmpty when longitude is missing", () =>
			Effect.gen(function* () {
				const { botToken, chatId } = yield* telegramConfig;
				yield* expectClientSchemaError(
					callSendVenue(botToken, {
						chat_id: chatId,
						latitude: 41.0,
						title: "Place",
						address: "Addr",
					}),
				);
			}),
		);
	});

	authErrorTests(test, token =>
		callSendVenue(token, { chat_id: 1, latitude: 41.0, longitude: 29.0, title: "Place", address: "Addr" }),
	);
});
