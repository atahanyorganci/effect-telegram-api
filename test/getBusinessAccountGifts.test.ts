import { describe } from "@effect/vitest";
import * as Effect from "effect/Effect";
import { authErrorTests, callClient, expectErrorTag, liveTests, telegramConfig } from "./helpers.ts";

const callGetBusinessAccountGifts = (token: string, payload: unknown) =>
	callClient("getBusinessAccountGifts", token, payload as never);

liveTests("getBusinessAccountGifts", test => {
	describe("Telegram API errors", () => {
		test.effect("BusinessConnectionNotFound when required parameters missing", () =>
			Effect.gen(function* () {
				const { botToken } = yield* telegramConfig;
				const error = yield* callGetBusinessAccountGifts(botToken, { business_connection_id: "invalid" }).pipe(
					Effect.flip,
				);

				expectErrorTag(error, "BusinessConnectionNotFound", "Bad Request: business connection not found");
			}),
		);
	});

	authErrorTests(test, token => callGetBusinessAccountGifts(token, { business_connection_id: "invalid" }));
});
