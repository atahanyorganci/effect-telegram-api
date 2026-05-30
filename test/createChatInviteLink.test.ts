import { assert, describe, it } from "@effect/vitest";
import * as Effect from "effect/Effect";
import * as Telegram from "../src/index.ts";
import { authErrorTests, expectErrorTag, LiveLayer, telegramConfig } from "./helpers.ts";

const callCreateChatInviteLink = (token: string, payload: unknown) =>
	Telegram.Client.callMethod(token, Telegram.Methods.createChatInviteLink, payload);

describe("createChatInviteLink", () => {
	describe("success", () => {
		it.effect("creates and revokes a named invite link for the test supergroup", () =>
			Effect.gen(function* () {
				const { botToken, groupId } = yield* telegramConfig;
				const link = yield* callCreateChatInviteLink(botToken, {
					chat_id: groupId,
					name: "integration-test",
				});

				assert.match(link.invite_link, /^https:\/\/t\.me\//);
				assert.strictEqual(link.name, "integration-test");

				yield* Telegram.Client.callMethod(botToken, Telegram.Methods.revokeChatInviteLink, {
					chat_id: groupId,
					invite_link: link.invite_link,
				});
			}).pipe(Effect.provide(LiveLayer)),
		);
	});

	describe("Telegram API errors", () => {
		it.effect("CantInviteMembersToPrivateChat when chat_id is a private chat", () =>
			Effect.gen(function* () {
				const { botToken, chatId } = yield* telegramConfig;
				const error = yield* callCreateChatInviteLink(botToken, { chat_id: chatId }).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.CantInviteMembersToPrivateChat>(
					error,
					"CantInviteMembersToPrivateChat",
					"Bad Request: can't invite members to a private chat",
				);
			}).pipe(Effect.provide(LiveLayer)),
		);

		it.effect("ChatNotFound when chat_id does not exist", () =>
			Effect.gen(function* () {
				const { botToken } = yield* telegramConfig;
				const error = yield* callCreateChatInviteLink(botToken, { chat_id: 0 }).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.ChatNotFound>(error, "ChatNotFound", "Bad Request: chat not found");
			}).pipe(Effect.provide(LiveLayer)),
		);

		it.effect("ChatIdEmpty when chat_id is missing", () =>
			Effect.gen(function* () {
				const { botToken } = yield* telegramConfig;
				const error = yield* callCreateChatInviteLink(botToken, {}).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.ChatIdEmpty>(error, "ChatIdEmpty", "Bad Request: chat_id is empty");
			}).pipe(Effect.provide(LiveLayer)),
		);
	});

	authErrorTests(token => callCreateChatInviteLink(token, { chat_id: 1 }));
});
