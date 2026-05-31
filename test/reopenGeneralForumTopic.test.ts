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

const callReopenGeneralForumTopic = (token: string, payload: unknown) =>
	callClient("reopenGeneralForumTopic", token, payload as never);

liveTests("reopenGeneralForumTopic", test => {
	describe("Telegram API errors", () => {
		test.effect("ChatAdminRequired when the bot is not a forum administrator", () =>
			Effect.gen(function* () {
				const { botToken, groupId } = yield* telegramConfig;
				const error = yield* callReopenGeneralForumTopic(botToken, { chat_id: groupId }).pipe(Effect.flip);

				expectErrorTag(error, "ChatAdminRequired", "Bad Request: CHAT_ADMIN_REQUIRED");
			}),
		);

		test.effect("ChatIdEmpty when required parameters missing", () =>
			Effect.gen(function* () {
				const { botToken } = yield* telegramConfig;
				yield* expectClientSchemaError(callReopenGeneralForumTopic(botToken, {}));
			}),
		);
	});

	authErrorTests(test, token => callReopenGeneralForumTopic(token, { chat_id: 0 }));
});
