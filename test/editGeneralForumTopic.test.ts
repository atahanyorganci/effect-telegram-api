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

const callEditGeneralForumTopic = (token: string, payload: unknown) =>
	callClient("editGeneralForumTopic", token, payload as never);

liveTests("editGeneralForumTopic", test => {
	describe("Telegram API errors", () => {
		test.effect("ChatAdminRequired when the bot is not a forum administrator", () =>
			Effect.gen(function* () {
				const { limitedBotToken, groupId } = yield* telegramConfig;
				const error = yield* callEditGeneralForumTopic(limitedBotToken, {
					chat_id: groupId,
					name: "General probe",
				}).pipe(Effect.flip);

				expectErrorTag(error, "ChatAdminRequired", "Bad Request: CHAT_ADMIN_REQUIRED");
			}),
		);

		test.effect("ChatIdEmpty when required parameters missing", () =>
			Effect.gen(function* () {
				const { botToken } = yield* telegramConfig;
				yield* expectClientSchemaError(callEditGeneralForumTopic(botToken, {}));
			}),
		);
	});

	authErrorTests(test, token => callEditGeneralForumTopic(token, { chat_id: 0, name: "test" }));
});
