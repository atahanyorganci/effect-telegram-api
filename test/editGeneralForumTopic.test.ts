import { describe, it } from "@effect/vitest";
import * as Effect from "effect/Effect";
import * as Telegram from "../src/index.ts";
import { authErrorTests, expectErrorTag, LiveLayer, telegramConfig } from "./helpers.ts";

const callEditGeneralForumTopic = (token: string, payload: unknown) =>
	Telegram.Client.callMethod(token, Telegram.Methods.editGeneralForumTopic, payload);

describe("editGeneralForumTopic", () => {
	describe("Telegram API errors", () => {
		it.effect("ChatAdminRequired when the bot is not a forum administrator", () =>
			Effect.gen(function* () {
				const { botToken, groupId } = yield* telegramConfig;
				const error = yield* callEditGeneralForumTopic(botToken, {
					chat_id: groupId,
					name: "General probe",
				}).pipe(Effect.flip);

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
				const error = yield* callEditGeneralForumTopic(botToken, {}).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.ChatIdEmpty>(error, "ChatIdEmpty", "Bad Request: chat_id is empty");
			}).pipe(Effect.provide(LiveLayer)),
		);
	});

	authErrorTests(token => callEditGeneralForumTopic(token, { chat_id: 0, name: "test" }));
});
