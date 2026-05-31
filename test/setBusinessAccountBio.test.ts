import { describe } from "@effect/vitest";
import * as Effect from "effect/Effect";
import { authErrorTests, callClient, expectErrorTag, liveTests, telegramConfig } from "./helpers.ts";

const callSetBusinessAccountBio = (token: string, payload: unknown) =>
	callClient("setBusinessAccountBio", token, payload as never);

liveTests("setBusinessAccountBio", test => {
	describe("Telegram API errors", () => {
		test.effect("BusinessConnectionNotFound when required parameters missing", () =>
			Effect.gen(function* () {
				const { botToken } = yield* telegramConfig;
				const error = yield* callSetBusinessAccountBio(botToken, { business_connection_id: "invalid" }).pipe(
					Effect.flip,
				);

				expectErrorTag(error, "BadRequest", "Bad Request: business connection not found");
			}),
		);
	});

	authErrorTests(test, token => callSetBusinessAccountBio(token, { business_connection_id: "invalid", bio: "" }));
});
