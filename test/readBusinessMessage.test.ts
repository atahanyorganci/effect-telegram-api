import { describe, it } from "@effect/vitest";
import * as Effect from "effect/Effect";
import * as Telegram from "../src/index.ts";
import { authErrorTests, expectErrorTag, LiveLayer, requireBotToken } from "./helpers.ts";

const callReadBusinessMessage = (token: string, payload: unknown) =>
	Telegram.Client.callMethod(token, Telegram.Methods.readBusinessMessage, payload);

describe("readBusinessMessage", () => {
	describe("Telegram API errors", () => {
		it.effect("ChatIdentifierEmpty when validation fails", () =>
			Effect.gen(function* () {
				const error = yield* callReadBusinessMessage(requireBotToken(), {}).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.ChatIdentifierEmpty>(
					error,
					"ChatIdentifierEmpty",
					"Bad Request: chat identifier is empty",
				);
			}).pipe(Effect.provide(LiveLayer)),
		);
	});

	authErrorTests(token => callReadBusinessMessage(token, {}));
});
