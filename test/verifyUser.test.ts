import { describe, it } from "@effect/vitest";
import * as Effect from "effect/Effect";
import * as Telegram from "../src/index.ts";
import { authErrorTests, expectErrorTag, LiveLayer, telegramConfig } from "./helpers.ts";

const callVerifyUser = (token: string, payload: unknown) =>
	Telegram.Client.callMethod(token, Telegram.Methods.verifyUser, payload);

describe("verifyUser", () => {
	describe("Telegram API errors", () => {
		it.effect("UserNotFound when user_id does not exist", () =>
			Effect.gen(function* () {
				const { botToken } = yield* telegramConfig;
				const error = yield* callVerifyUser(botToken, {
					user_id: 1,
					custom_description: "probe",
				}).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.UserNotFound>(error, "UserNotFound", "Bad Request: user not found");
			}).pipe(Effect.provide(LiveLayer)),
		);

		it.effect("InvalidUserId when required parameters missing", () =>
			Effect.gen(function* () {
				const { botToken } = yield* telegramConfig;
				const error = yield* callVerifyUser(botToken, {}).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.InvalidUserId>(error, "InvalidUserId", "Bad Request: invalid user_id specified");
			}).pipe(Effect.provide(LiveLayer)),
		);
	});

	authErrorTests(token => callVerifyUser(token, { user_id: 0 }));
});
