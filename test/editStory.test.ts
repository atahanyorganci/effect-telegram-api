import { describe } from "@effect/vitest";
import * as Effect from "effect/Effect";
import { authErrorTests, callClient, expectClientSchemaError, liveTests, telegramConfig } from "./helpers.ts";

const callEditStory = (token: string, payload: unknown) => callClient("editStory", token, payload as never);

liveTests("editStory", test => {
	describe("Telegram API errors", () => {
		test.effect("StoryContentNotSpecified when required parameters missing", () =>
			Effect.gen(function* () {
				const { botToken } = yield* telegramConfig;
				yield* expectClientSchemaError(callEditStory(botToken, { business_connection_id: "invalid", story_id: 0 }));
			}),
		);
	});

	authErrorTests(test, token =>
		callEditStory(token, {
			business_connection_id: "invalid",
			story_id: 0,
			content: { type: "photo", photo: { file_id: "invalid" } },
		}),
	);
});
