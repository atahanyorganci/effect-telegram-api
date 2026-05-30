import { describe, it } from "@effect/vitest";
import * as Effect from "effect/Effect";
import * as Telegram from "../src/index.ts";
import { authErrorTests, expectErrorTag, LiveLayer, telegramConfig } from "./helpers.ts";

const callRevokeChatInviteLink = (token: string, payload: unknown) =>
	Telegram.Client.callMethod(token, Telegram.Methods.revokeChatInviteLink, payload);

describe("revokeChatInviteLink", () => {
	describe("Telegram API errors", () => {
		it.effect("InviteHashExpired when invite_link is invalid", () =>
			Effect.gen(function* () {
				const { botToken, groupId } = yield* telegramConfig;
				const error = yield* callRevokeChatInviteLink(botToken, {
					chat_id: groupId,
					invite_link: "https://t.me/+invalid",
				}).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.InviteHashExpired>(
					error,
					"InviteHashExpired",
					"Bad Request: INVITE_HASH_EXPIRED",
				);
			}).pipe(Effect.provide(LiveLayer)),
		);

		it.effect("ChatIdEmpty when required parameters missing", () =>
			Effect.gen(function* () {
				const { botToken } = yield* telegramConfig;
				const error = yield* callRevokeChatInviteLink(botToken, {}).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.ChatIdEmpty>(error, "ChatIdEmpty", "Bad Request: chat_id is empty");
			}).pipe(Effect.provide(LiveLayer)),
		);
	});

	authErrorTests(token => callRevokeChatInviteLink(token, { chat_id: 0, invite_link: "https://t.me/+invalid" }));
});
