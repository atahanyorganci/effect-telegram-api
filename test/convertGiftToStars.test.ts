import { describe, it } from "@effect/vitest";
import * as Effect from "effect/Effect";
import * as Telegram from "../src/index.ts";
import { authErrorTests, expectErrorTag, LiveLayer, requireBotToken } from "./helpers.ts";

const callConvertGiftToStars = (token: string, payload: unknown) =>
	Telegram.Client.callMethod(token, Telegram.Methods.convertGiftToStars, payload);

describe("convertGiftToStars", () => {
	describe("Telegram API errors", () => {
		it.effect("BusinessConnectionNotFound when required parameters missing", () =>
			Effect.gen(function* () {
				const error = yield* callConvertGiftToStars(requireBotToken(), {}).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.BusinessConnectionNotFound>(
					error,
					"BusinessConnectionNotFound",
					"Bad Request: business connection not found",
				);
			}).pipe(Effect.provide(LiveLayer)),
		);
	});

	authErrorTests(token =>
		callConvertGiftToStars(token, { business_connection_id: "invalid", owned_gift_id: "invalid" }),
	);
});
