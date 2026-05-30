import { describe, it } from "@effect/vitest";
import * as Effect from "effect/Effect";
import * as Telegram from "../src/index.ts";
import { authErrorTests, expectErrorTag, LiveLayer, telegramConfig } from "./helpers.ts";

const callUnhideGeneralForumTopic = (token: string, payload: unknown) =>
	Telegram.Client.callMethod(token, Telegram.Methods.unhideGeneralForumTopic, payload);

describe("unhideGeneralForumTopic", () => {
	describe("Telegram API errors", () => {
		it.effect("NotEnoughRightsToCloseOrOpenTopic when the bot cannot manage the general forum topic", () =>
			Effect.gen(function* () {
				const { botToken, groupId } = yield* telegramConfig;
				const error = yield* callUnhideGeneralForumTopic(botToken, { chat_id: groupId }).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.NotEnoughRightsToCloseOrOpenTopic>(
					error,
					"NotEnoughRightsToCloseOrOpenTopic",
					"Bad Request: not enough rights to close or open the topic",
				);
			}).pipe(Effect.provide(LiveLayer)),
		);

		it.effect("ChatIdEmpty when required parameters missing", () =>
			Effect.gen(function* () {
				const { botToken } = yield* telegramConfig;
				const error = yield* callUnhideGeneralForumTopic(botToken, {}).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.ChatIdEmpty>(error, "ChatIdEmpty", "Bad Request: chat_id is empty");
			}).pipe(Effect.provide(LiveLayer)),
		);
	});

	authErrorTests(token => callUnhideGeneralForumTopic(token, { chat_id: 0 }));
});
