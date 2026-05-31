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

const callHideGeneralForumTopic = (token: string, payload: unknown) =>
	callClient("hideGeneralForumTopic", token, payload as never);

liveTests("hideGeneralForumTopic", test => {
	describe("Telegram API errors", () => {
		test.effect("NotEnoughRightsToCloseOrOpenTopic when the bot cannot manage the general forum topic", () =>
			Effect.gen(function* () {
				const { limitedBotToken, groupId } = yield* telegramConfig;
				const error = yield* callHideGeneralForumTopic(limitedBotToken, { chat_id: groupId }).pipe(Effect.flip);

				expectErrorTag(
					error,
					"NotEnoughRightsToCloseOrOpenTopic",
					"Bad Request: not enough rights to close or open the topic",
				);
			}),
		);

		test.effect("ChatIdEmpty when required parameters missing", () =>
			Effect.gen(function* () {
				const { botToken } = yield* telegramConfig;
				yield* expectClientSchemaError(callHideGeneralForumTopic(botToken, {}));
			}),
		);
	});

	authErrorTests(test, token => callHideGeneralForumTopic(token, { chat_id: 0 }));
});
