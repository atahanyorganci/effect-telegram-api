import { describe, it } from "@effect/vitest";
import * as Effect from "effect/Effect";
import * as Telegram from "../src/index.ts";
import { authErrorTests, expectErrorTag, LiveLayer, requireBotToken } from "./helpers.ts";

const callPostStory = (token: string, payload: unknown) =>
	Telegram.Client.callMethod(token, Telegram.Methods.postStory, payload);

describe("postStory", () => {
	describe("Telegram API errors", () => {
		it.effect("StoryContentNotSpecified when validation fails", () =>
			Effect.gen(function* () {
				const error = yield* callPostStory(requireBotToken(), {}).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.StoryContentNotSpecified>(
					error,
					"StoryContentNotSpecified",
					"Bad Request: story content isn't specified",
				);
			}).pipe(Effect.provide(LiveLayer)),
		);
	});

	authErrorTests(token => callPostStory(token, {}));
});
