import { describe, it } from "@effect/vitest";
import * as Effect from "effect/Effect";
import * as Telegram from "../src/index.ts";
import { authErrorTests, expectErrorTag, LiveLayer, telegramConfig } from "./helpers.ts";

const callRepostStory = (token: string, payload: unknown) =>
	Telegram.Client.callMethod(token, Telegram.Methods.repostStory, payload);

describe("repostStory", () => {
	describe("Telegram API errors", () => {
		it.effect("BusinessConnectionNotFound when reposting without a business connection", () =>
			Effect.gen(function* () {
				const { botToken, groupId } = yield* telegramConfig;
				const error = yield* callRepostStory(botToken, {
					from_chat_id: groupId,
					story_id: 1,
				}).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.BusinessConnectionNotFound>(
					error,
					"BusinessConnectionNotFound",
					"Bad Request: business connection not found",
				);
			}).pipe(Effect.provide(LiveLayer)),
		);

		it.effect("FromChatIdRequired when required parameters missing", () =>
			Effect.gen(function* () {
				const { botToken } = yield* telegramConfig;
				const error = yield* callRepostStory(botToken, {}).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.FromChatIdRequired>(
					error,
					"FromChatIdRequired",
					'Bad Request: parameter "from_chat_id" is required',
				);
			}).pipe(Effect.provide(LiveLayer)),
		);
	});

	authErrorTests(token =>
		callRepostStory(token, {
			business_connection_id: "invalid",
			from_chat_id: 0,
			from_story_id: 0,
			active_period: 3600,
		}),
	);
});
