import { assert, describe } from "@effect/vitest";
import * as Effect from "effect/Effect";
import {
	authErrorTests,
	callClient,
	expectClientSchemaError,
	expectErrorTag,
	liveTests,
	telegramConfig,
} from "./helpers.ts";

const callCreateChatInviteLink = (token: string, payload: unknown) =>
	callClient("createChatInviteLink", token, payload as never);

liveTests("createChatInviteLink", test => {
	describe("success", () => {
		test.effect("creates and revokes a named invite link for the test supergroup", () =>
			Effect.gen(function* () {
				const { botToken, groupId } = yield* telegramConfig;
				const link = yield* callCreateChatInviteLink(botToken, {
					chat_id: groupId,
					name: "integration-test",
				});

				assert.match(link.invite_link, /^https:\/\/t\.me\//);
				assert.strictEqual(link.name, "integration-test");

				yield* callClient("revokeChatInviteLink", botToken, {
					chat_id: groupId,
					invite_link: link.invite_link,
				});
			}),
		);
	});

	describe("Telegram API errors", () => {
		test.effect("CantInviteMembersToPrivateChat when chat_id is a private chat", () =>
			Effect.gen(function* () {
				const { botToken, chatId } = yield* telegramConfig;
				const error = yield* callCreateChatInviteLink(botToken, { chat_id: chatId }).pipe(Effect.flip);

				expectErrorTag(error, "BadRequest", "Bad Request: can't invite members to a private chat");
			}),
		);

		test.effect("ChatNotFound when chat_id does not exist", () =>
			Effect.gen(function* () {
				const { botToken } = yield* telegramConfig;
				const error = yield* callCreateChatInviteLink(botToken, { chat_id: 0 }).pipe(Effect.flip);

				expectErrorTag(error, "BadRequest", "Bad Request: chat not found");
			}),
		);

		test.effect("ChatIdEmpty when chat_id is missing", () =>
			Effect.gen(function* () {
				const { botToken } = yield* telegramConfig;
				yield* expectClientSchemaError(callCreateChatInviteLink(botToken, {}));
			}),
		);
	});

	authErrorTests(test, token => callCreateChatInviteLink(token, { chat_id: 1 }));
});
