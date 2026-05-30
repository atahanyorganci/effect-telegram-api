import { assert, describe, it } from "@effect/vitest";
import * as Effect from "effect/Effect";
import * as Telegram from "../src/index.ts";
import { authErrorTests, expectErrorTag, LiveLayer, requireBotToken, requireChatId } from "./helpers.ts";

const callSendVenue = (token: string, payload: unknown) =>
	Telegram.Client.callMethod(token, Telegram.Methods.sendVenue, payload);

describe("sendVenue", () => {
	describe("success", () => {
		it.effect("returns the sent venue message", () =>
			Effect.gen(function* () {
				const message = yield* callSendVenue(requireBotToken(), {
					chat_id: requireChatId(),
					latitude: 41.0082,
					longitude: 28.9784,
					title: "Istanbul",
					address: "Turkey",
				});

				assert.strictEqual(typeof message.message_id, "number");
				assert.strictEqual(typeof message.venue?.location?.latitude, "number");
				assert.strictEqual(typeof message.venue?.location?.longitude, "number");
			}).pipe(Effect.provide(LiveLayer)),
		);
	});

	describe("Telegram API errors", () => {
		it.effect("ChatIdEmpty when chat_id is missing", () =>
			Effect.gen(function* () {
				const error = yield* callSendVenue(requireBotToken(), {
					latitude: 41.0,
					longitude: 29.0,
					title: "Place",
					address: "Addr",
				}).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.ChatIdEmpty>(error, "ChatIdEmpty", "Bad Request: chat_id is empty");
			}).pipe(Effect.provide(LiveLayer)),
		);

		it.effect("ChatNotFound when chat_id does not exist", () =>
			Effect.gen(function* () {
				const error = yield* callSendVenue(requireBotToken(), {
					chat_id: 0,
					latitude: 41.0,
					longitude: 29.0,
					title: "Place",
					address: "Addr",
				}).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.ChatNotFound>(error, "ChatNotFound", "Bad Request: chat not found");
			}).pipe(Effect.provide(LiveLayer)),
		);

		it.effect("LatitudeEmpty when latitude is missing", () =>
			Effect.gen(function* () {
				const error = yield* callSendVenue(requireBotToken(), {
					chat_id: requireChatId(),
					longitude: 29.0,
					title: "Place",
					address: "Addr",
				}).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.LatitudeEmpty>(error, "LatitudeEmpty", "Bad Request: latitude is empty");
			}).pipe(Effect.provide(LiveLayer)),
		);

		it.effect("LongitudeEmpty when longitude is missing", () =>
			Effect.gen(function* () {
				const error = yield* callSendVenue(requireBotToken(), {
					chat_id: requireChatId(),
					latitude: 41.0,
					title: "Place",
					address: "Addr",
				}).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.LongitudeEmpty>(error, "LongitudeEmpty", "Bad Request: longitude is empty");
			}).pipe(Effect.provide(LiveLayer)),
		);
	});

	authErrorTests(token =>
		callSendVenue(token, { chat_id: 1, latitude: 41.0, longitude: 29.0, title: "Place", address: "Addr" }),
	);
});
