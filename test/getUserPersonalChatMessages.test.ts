import { describe, it } from "@effect/vitest";
import * as Effect from "effect/Effect";
import * as Telegram from "../src/index.ts";
import { authErrorTests, expectErrorTag, LiveLayer, telegramConfig } from "./helpers.ts";

const callGetUserPersonalChatMessages = (token: string, payload: unknown) =>
	Telegram.Client.callMethod(token, Telegram.Methods.getUserPersonalChatMessages, payload);

describe("getUserPersonalChatMessages", () => {
	describe("Telegram API errors", () => {
		it.effect("LimitMustBePositive when limit is zero", () =>
			Effect.gen(function* () {
				const { botToken, chatId } = yield* telegramConfig;
				const error = yield* callGetUserPersonalChatMessages(botToken, {
					user_id: chatId,
					limit: 0,
				}).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.LimitMustBePositive>(
					error,
					"LimitMustBePositive",
					"Bad Request: limit must be positive",
				);
			}).pipe(Effect.provide(LiveLayer)),
		);

		it.effect("InvalidUserId when required parameters missing", () =>
			Effect.gen(function* () {
				const { botToken } = yield* telegramConfig;
				const error = yield* callGetUserPersonalChatMessages(botToken, {}).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.InvalidUserId>(error, "InvalidUserId", "Bad Request: invalid user_id specified");
			}).pipe(Effect.provide(LiveLayer)),
		);
	});

	authErrorTests(token => callGetUserPersonalChatMessages(token, { user_id: 0, limit: 1 }));
});
