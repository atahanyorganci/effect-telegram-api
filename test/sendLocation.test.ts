import { assert, describe, it } from "@effect/vitest";
import * as Effect from "effect/Effect";
import * as Telegram from "../src/index.ts";
import { authErrorTests, expectErrorTag, LiveLayer, requireBotToken, requireChatId } from "./helpers.ts";

const callSendLocation = (token: string, payload: unknown) =>
	Telegram.Client.callMethod(token, Telegram.Methods.sendLocation, payload);

describe("sendLocation", () => {
	describe("success", () => {
		it.effect("returns the sent location message", () =>
			Effect.gen(function* () {
				const message = yield* callSendLocation(requireBotToken(), {
					chat_id: requireChatId(),
					latitude: 41.0082,
					longitude: 28.9784,
				});

				assert.strictEqual(typeof message.message_id, "number");
				assert.strictEqual(typeof message.location?.latitude, "number");
				assert.strictEqual(typeof message.location?.longitude, "number");
			}).pipe(Effect.provide(LiveLayer)),
		);
	});

	describe("Telegram API errors", () => {
		it.effect("ChatIdEmpty when chat_id is missing", () =>
			Effect.gen(function* () {
				const error = yield* callSendLocation(requireBotToken(), { latitude: 41.0, longitude: 29.0 }).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.ChatIdEmpty>(error, "ChatIdEmpty", "Bad Request: chat_id is empty");
			}).pipe(Effect.provide(LiveLayer)),
		);

		it.effect("LatitudeEmpty when latitude is missing", () =>
			Effect.gen(function* () {
				const error = yield* callSendLocation(requireBotToken(), {
					chat_id: requireChatId(),
					longitude: 29.0,
				}).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.LatitudeEmpty>(error, "LatitudeEmpty", "Bad Request: latitude is empty");
			}).pipe(Effect.provide(LiveLayer)),
		);
	});

	authErrorTests(token => callSendLocation(token, { chat_id: 1, latitude: 41.0, longitude: 29.0 }));
});
