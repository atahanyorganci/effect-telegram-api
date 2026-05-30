import { describe, it } from "@effect/vitest";
import * as Effect from "effect/Effect";
import * as Telegram from "../src/index.ts";
import { authErrorTests, expectErrorTag, LiveLayer, telegramConfig } from "./helpers.ts";

const callCloseGeneralForumTopic = (token: string, payload: unknown) =>
	Telegram.Client.callMethod(token, Telegram.Methods.closeGeneralForumTopic, payload);

describe("closeGeneralForumTopic", () => {
	describe("Telegram API errors", () => {
		it.effect("ChatAdminRequired when the bot is not a forum administrator", () =>
			Effect.gen(function* () {
				const { botToken, groupId } = yield* telegramConfig;
				const error = yield* callCloseGeneralForumTopic(botToken, { chat_id: groupId }).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.ChatAdminRequired>(
					error,
					"ChatAdminRequired",
					"Bad Request: CHAT_ADMIN_REQUIRED",
				);
			}).pipe(Effect.provide(LiveLayer)),
		);

		it.effect("ChatIdEmpty when required parameters missing", () =>
			Effect.gen(function* () {
				const { botToken } = yield* telegramConfig;
				const error = yield* callCloseGeneralForumTopic(botToken, {}).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.ChatIdEmpty>(error, "ChatIdEmpty", "Bad Request: chat_id is empty");
			}).pipe(Effect.provide(LiveLayer)),
		);
	});

	authErrorTests(token => callCloseGeneralForumTopic(token, { chat_id: 0 }));
});
