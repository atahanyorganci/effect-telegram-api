import { describe, it } from "@effect/vitest";
import * as Effect from "effect/Effect";
import * as Telegram from "../src/index.ts";
import { authErrorTests, expectErrorTag, LiveLayer, requireBotToken } from "./helpers.ts";

const callSetBusinessAccountGiftSettings = (token: string, payload: unknown) =>
	Telegram.Client.callMethod(token, Telegram.Methods.setBusinessAccountGiftSettings, payload);

describe("setBusinessAccountGiftSettings", () => {
	describe("Telegram API errors", () => {
		it.effect("AcceptedGiftTypesNotSpecified when required parameters missing", () =>
			Effect.gen(function* () {
				const error = yield* callSetBusinessAccountGiftSettings(requireBotToken(), {}).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.AcceptedGiftTypesNotSpecified>(
					error,
					"AcceptedGiftTypesNotSpecified",
					"Bad Request: accepted gift types aren't specified",
				);
			}).pipe(Effect.provide(LiveLayer)),
		);
	});

	authErrorTests(token =>
		callSetBusinessAccountGiftSettings(token, {
			business_connection_id: "invalid",
			show_gift_button: true,
			accepted_gift_types: {},
		}),
	);
});
