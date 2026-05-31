import { describe } from "@effect/vitest";
import * as Effect from "effect/Effect";
import {
	authErrorTests,
	callClient,
	expectClientSchemaError,
	expectErrorTag,
	liveTests,
	telegramConfig,
} from "./helpers.ts";

const callRepostStory = (token: string, payload: unknown) => callClient("repostStory", token, payload as never);

liveTests("repostStory", test => {
	describe("Telegram API errors", () => {
		test.effect("BusinessConnectionNotFound when reposting without a business connection", () =>
			Effect.gen(function* () {
				const { botToken, groupId } = yield* telegramConfig;
				const error = yield* callRepostStory(botToken, {
					business_connection_id: "invalid",
					from_chat_id: groupId,
					from_story_id: 1,
					active_period: 3600,
				}).pipe(Effect.flip);

				expectErrorTag(error, "BadRequest", "Bad Request: business connection not found");
			}),
		);

		test.effect("FromChatIdRequired when required parameters missing", () =>
			Effect.gen(function* () {
				const { botToken } = yield* telegramConfig;
				yield* expectClientSchemaError(callRepostStory(botToken, {}));
			}),
		);
	});

	authErrorTests(test, token =>
		callRepostStory(token, {
			business_connection_id: "invalid",
			from_chat_id: 0,
			from_story_id: 0,
			active_period: 3600,
		}),
	);
});
