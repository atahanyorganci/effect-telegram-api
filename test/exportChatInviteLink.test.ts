import { describe, it } from "@effect/vitest";
import * as Effect from "effect/Effect";
import * as Telegram from "../src/index.ts";
import { authErrorTests, expectErrorTag, LiveLayer, requireBotToken, requireChatId } from "./helpers.ts";

const callExportChatInviteLink = (token: string, payload: unknown) =>
	Telegram.Client.callMethod(token, Telegram.Methods.exportChatInviteLink, payload);

describe("exportChatInviteLink", () => {
	describe("Telegram API errors", () => {
		it.effect("CantInviteMembersToPrivateChat when chat_id is a private chat", () =>
			Effect.gen(function* () {
				const error = yield* callExportChatInviteLink(requireBotToken(), { chat_id: requireChatId() }).pipe(
					Effect.flip,
				);

				expectErrorTag<Telegram.Errors.CantInviteMembersToPrivateChat>(
					error,
					"CantInviteMembersToPrivateChat",
					"Bad Request: can't invite members to a private chat",
				);
			}).pipe(Effect.provide(LiveLayer)),
		);

		it.effect("ChatNotFound when chat_id does not exist", () =>
			Effect.gen(function* () {
				const error = yield* callExportChatInviteLink(requireBotToken(), { chat_id: 0 }).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.ChatNotFound>(error, "ChatNotFound", "Bad Request: chat not found");
			}).pipe(Effect.provide(LiveLayer)),
		);

		it.effect("ChatIdEmpty when chat_id is missing", () =>
			Effect.gen(function* () {
				const error = yield* callExportChatInviteLink(requireBotToken(), {}).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.ChatIdEmpty>(error, "ChatIdEmpty", "Bad Request: chat_id is empty");
			}).pipe(Effect.provide(LiveLayer)),
		);
	});

	authErrorTests(token => callExportChatInviteLink(token, { chat_id: 1 }));
});
