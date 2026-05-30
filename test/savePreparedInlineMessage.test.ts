import { describe, it } from "@effect/vitest";
import * as Effect from "effect/Effect";
import * as Telegram from "../src/index.ts";
import { authErrorTests, expectErrorTag, LiveLayer, requireBotToken } from "./helpers.ts";

const callSavePreparedInlineMessage = (token: string, payload: unknown) =>
	Telegram.Client.callMethod(token, Telegram.Methods.savePreparedInlineMessage, payload);

describe("savePreparedInlineMessage", () => {
	describe("Telegram API errors", () => {
		it.effect("InvalidUserId when required parameters missing", () =>
			Effect.gen(function* () {
				const error = yield* callSavePreparedInlineMessage(requireBotToken(), {}).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.InvalidUserId>(error, "InvalidUserId", "Bad Request: invalid user_id specified");
			}).pipe(Effect.provide(LiveLayer)),
		);
	});

	authErrorTests(token => callSavePreparedInlineMessage(token, { user_id: 0, result: {} }));
});
