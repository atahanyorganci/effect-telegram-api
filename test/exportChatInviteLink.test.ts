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

const callExportChatInviteLink = (token: string, payload: unknown) =>
	callClient("exportChatInviteLink", token, payload as never);

liveTests("exportChatInviteLink", test => {
	describe("success", () => {
		test.effect("returns an invite link for the test supergroup", () =>
			Effect.gen(function* () {
				const { botToken, groupId } = yield* telegramConfig;
				const inviteLink = yield* callExportChatInviteLink(botToken, { chat_id: groupId });

				assert.match(inviteLink, /^https:\/\/t\.me\//);
			}),
		);
	});

	describe("Telegram API errors", () => {
		test.effect("CantInviteMembersToPrivateChat when chat_id is a private chat", () =>
			Effect.gen(function* () {
				const { botToken, chatId } = yield* telegramConfig;
				const error = yield* callExportChatInviteLink(botToken, { chat_id: chatId }).pipe(Effect.flip);

				expectErrorTag(error, "CantInviteMembersToPrivateChat", "Bad Request: can't invite members to a private chat");
			}),
		);

		test.effect("ChatNotFound when chat_id does not exist", () =>
			Effect.gen(function* () {
				const { botToken } = yield* telegramConfig;
				const error = yield* callExportChatInviteLink(botToken, { chat_id: 0 }).pipe(Effect.flip);

				expectErrorTag(error, "ChatNotFound", "Bad Request: chat not found");
			}),
		);

		test.effect("ChatIdEmpty when chat_id is missing", () =>
			Effect.gen(function* () {
				const { botToken } = yield* telegramConfig;
				yield* expectClientSchemaError(callExportChatInviteLink(botToken, {}));
			}),
		);
	});

	authErrorTests(test, token => callExportChatInviteLink(token, { chat_id: 1 }));
});
