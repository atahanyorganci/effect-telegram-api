import { describe, it } from "@effect/vitest";
import * as Effect from "effect/Effect";
import * as Telegram from "../src/index.ts";
import { authErrorTests, expectErrorTag, LiveLayer, telegramConfig } from "./helpers.ts";

const callRemoveUserVerification = (token: string, payload: unknown) =>
	Telegram.Client.callMethod(token, Telegram.Methods.removeUserVerification, payload);

describe("removeUserVerification", () => {
	describe("Telegram API errors", () => {
		it.effect("PeerIdInvalid when user_id is invalid", () =>
			Effect.gen(function* () {
				const { botToken } = yield* telegramConfig;
				const error = yield* callRemoveUserVerification(botToken, { user_id: 1 }).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.PeerIdInvalid>(error, "PeerIdInvalid", "Bad Request: PEER_ID_INVALID");
			}).pipe(Effect.provide(LiveLayer)),
		);

		it.effect("InvalidUserId when required parameters missing", () =>
			Effect.gen(function* () {
				const { botToken } = yield* telegramConfig;
				const error = yield* callRemoveUserVerification(botToken, {}).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.InvalidUserId>(error, "InvalidUserId", "Bad Request: invalid user_id specified");
			}).pipe(Effect.provide(LiveLayer)),
		);
	});

	authErrorTests(token => callRemoveUserVerification(token, { user_id: 0 }));
});
