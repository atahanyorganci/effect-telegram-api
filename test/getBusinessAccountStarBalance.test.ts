import { describe } from "@effect/vitest";
import * as Effect from "effect/Effect";
import { authErrorTests, callClient, expectErrorTag, liveTests, telegramConfig } from "./helpers.ts";

const callGetBusinessAccountStarBalance = (token: string, payload: unknown) =>
	callClient("getBusinessAccountStarBalance", token, payload as never);

liveTests("getBusinessAccountStarBalance", test => {
	describe("Telegram API errors", () => {
		test.effect("BusinessConnectionNotFound when required parameters missing", () =>
			Effect.gen(function* () {
				const { botToken } = yield* telegramConfig;
				const error = yield* callGetBusinessAccountStarBalance(botToken, { business_connection_id: "invalid" }).pipe(
					Effect.flip,
				);

				expectErrorTag(error, "BadRequest", "Bad Request: business connection not found");
			}),
		);
	});

	authErrorTests(test, token => callGetBusinessAccountStarBalance(token, { business_connection_id: "invalid" }));
});
