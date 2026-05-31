import { describe } from "@effect/vitest";
import * as Effect from "effect/Effect";
import { authErrorTests, callClient, expectClientSchemaError, liveTests, telegramConfig } from "./helpers.ts";

const callPostStory = (token: string, payload: unknown) => callClient("postStory", token, payload as never);

liveTests("postStory", test => {
	describe("Telegram API errors", () => {
		test.effect("StoryContentNotSpecified when validation fails", () =>
			Effect.gen(function* () {
				const { botToken } = yield* telegramConfig;
				yield* expectClientSchemaError(callPostStory(botToken, {}));
			}),
		);
	});

	authErrorTests(test, token =>
		callPostStory(token, {
			business_connection_id: "invalid",
			content: { type: "photo", photo: { file_id: "invalid" } },
			active_period: 86400,
		}),
	);
});
