import { describe } from "@effect/vitest";
import * as Effect from "effect/Effect";
import { authErrorTests, callClient, expectClientSchemaError, liveTests, telegramConfig } from "./helpers.ts";

const callDeleteStory = (token: string, payload: unknown) => callClient("deleteStory", token, payload as never);

liveTests("deleteStory", test => {
	describe("Telegram API errors", () => {
		test.effect("BusinessConnectionNotFound when required parameters missing", () =>
			Effect.gen(function* () {
				const { botToken } = yield* telegramConfig;
				yield* expectClientSchemaError(callDeleteStory(botToken, { business_connection_id: "invalid" }));
			}),
		);
	});

	authErrorTests(test, token => callDeleteStory(token, { business_connection_id: "invalid", story_id: 0 }));
});
