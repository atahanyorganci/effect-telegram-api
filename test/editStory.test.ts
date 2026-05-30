import { describe, it } from "@effect/vitest";
import * as Effect from "effect/Effect";
import * as Telegram from "../src/index.ts";
import { authErrorTests, expectErrorTag, LiveLayer, requireBotToken } from "./helpers.ts";

const callEditStory = (token: string, payload: unknown) =>
	Telegram.Client.callMethod(token, Telegram.Methods.editStory, payload);

describe("editStory", () => {
	describe("Telegram API errors", () => {
		it.effect("StoryContentNotSpecified when required parameters missing", () =>
			Effect.gen(function* () {
				const error = yield* callEditStory(requireBotToken(), {}).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.StoryContentNotSpecified>(
					error,
					"StoryContentNotSpecified",
					"Bad Request: story content isn't specified",
				);
			}).pipe(Effect.provide(LiveLayer)),
		);
	});

	authErrorTests(token =>
		callEditStory(token, {
			business_connection_id: "invalid",
			story_id: 0,
			content: { type: "photo", photo: { file_id: "invalid" } },
		}),
	);
});
