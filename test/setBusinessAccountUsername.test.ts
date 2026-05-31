import { describe } from "@effect/vitest";
import * as Effect from "effect/Effect";
import { authErrorTests, callClient, expectErrorTag, liveTests, telegramConfig } from "./helpers.ts";

const callSetBusinessAccountUsername = (token: string, payload: unknown) =>
	callClient("setBusinessAccountUsername", token, payload as never);

liveTests("setBusinessAccountUsername", test => {
	describe("Telegram API errors", () => {
		test.effect("BusinessConnectionNotFound when required parameters missing", () =>
			Effect.gen(function* () {
				const { botToken } = yield* telegramConfig;
				const error = yield* callSetBusinessAccountUsername(botToken, { business_connection_id: "invalid" }).pipe(
					Effect.flip,
				);

				expectErrorTag(error, "BadRequest", "Bad Request: business connection not found");
			}),
		);
	});

	authErrorTests(test, token =>
		callSetBusinessAccountUsername(token, { business_connection_id: "invalid", username: "invalid" }),
	);
});
