import { describe, it } from "@effect/vitest";
import * as Effect from "effect/Effect";
import * as Telegram from "../src/index.ts";
import { authErrorTests, expectErrorTag, LiveLayer, requireBotToken } from "./helpers.ts";

const callSetUserEmojiStatus = (token: string, payload: unknown) =>
	Telegram.Client.callMethod(token, Telegram.Methods.setUserEmojiStatus, payload);

describe("setUserEmojiStatus", () => {
	describe("Telegram API errors", () => {
		it.effect("InvalidUserId when required parameters missing", () =>
			Effect.gen(function* () {
				const error = yield* callSetUserEmojiStatus(requireBotToken(), {}).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.InvalidUserId>(error, "InvalidUserId", "Bad Request: invalid user_id specified");
			}).pipe(Effect.provide(LiveLayer)),
		);
	});

	authErrorTests(token => callSetUserEmojiStatus(token, { user_id: 0 }));
});
