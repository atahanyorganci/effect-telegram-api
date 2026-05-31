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

const callCloseGeneralForumTopic = (token: string, payload: unknown) =>
	callClient("closeGeneralForumTopic", token, payload as never);

liveTests("closeGeneralForumTopic", test => {
	describe("Telegram API errors", () => {
		test.effect("ChatAdminRequired when the bot is not a forum administrator", () =>
			Effect.gen(function* () {
				const { botToken, groupId } = yield* telegramConfig;
				const error = yield* callCloseGeneralForumTopic(botToken, { chat_id: groupId }).pipe(Effect.flip);

				expectErrorTag(error, "ChatAdminRequired", "Bad Request: CHAT_ADMIN_REQUIRED");
			}),
		);

		test.effect("ChatIdEmpty when required parameters missing", () =>
			Effect.gen(function* () {
				const { botToken } = yield* telegramConfig;
				yield* expectClientSchemaError(callCloseGeneralForumTopic(botToken, {}));
			}),
		);
	});

	authErrorTests(test, token => callCloseGeneralForumTopic(token, { chat_id: 0 }));
});
