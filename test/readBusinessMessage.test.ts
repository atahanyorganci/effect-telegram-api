import { describe, it } from "@effect/vitest";
import * as Effect from "effect/Effect";
import * as Telegram from "../src/index.ts";
import { authErrorTests, expectErrorTag, LiveLayer, telegramConfig } from "./helpers.ts";

const callReadBusinessMessage = (token: string, payload: unknown) =>
	Telegram.Client.callMethod(token, Telegram.Methods.readBusinessMessage, payload);

describe("readBusinessMessage", () => {
	describe("Telegram API errors", () => {
		it.effect("ChatIdentifierEmpty when validation fails", () =>
			Effect.gen(function* () {
				const { botToken } = yield* telegramConfig;
				const error = yield* callReadBusinessMessage(botToken, {}).pipe(Effect.flip);

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
