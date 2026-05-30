import { describe, it } from "@effect/vitest";
import * as Effect from "effect/Effect";
import * as Telegram from "../src/index.ts";
import { authErrorTests, expectErrorTag, LiveLayer, telegramConfig } from "./helpers.ts";

const callSetChatMemberTag = (token: string, payload: unknown) =>
	Telegram.Client.callMethod(token, Telegram.Methods.setChatMemberTag, payload);

describe("setChatMemberTag", () => {
	describe("Telegram API errors", () => {
		it.effect("ParticipantIdInvalid when user_id is not a chat participant", () =>
			Effect.gen(function* () {
				const { botToken, groupId } = yield* telegramConfig;
				const error = yield* callSetChatMemberTag(botToken, {
					chat_id: groupId,
					user_id: 1,
					tag: "probe",
				}).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.ParticipantIdInvalid>(
					error,
					"ParticipantIdInvalid",
					"Bad Request: PARTICIPANT_ID_INVALID",
				);
			}).pipe(Effect.provide(LiveLayer)),
		);

		it.effect("ChatCreatorRequired when only the chat creator can set member tags", () =>
			Effect.gen(function* () {
				const { botToken, groupId, chatId } = yield* telegramConfig;
				const error = yield* callSetChatMemberTag(botToken, {
					chat_id: groupId,
					user_id: chatId,
					tag: "",
				}).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.ChatCreatorRequired>(
					error,
					"ChatCreatorRequired",
					"Bad Request: CHAT_CREATOR_REQUIRED",
				);
			}).pipe(Effect.provide(LiveLayer)),
		);

		it.effect("InvalidUserId when required parameters missing", () =>
			Effect.gen(function* () {
				const { botToken } = yield* telegramConfig;
				const error = yield* callSetChatMemberTag(botToken, {}).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.InvalidUserId>(error, "InvalidUserId", "Bad Request: invalid user_id specified");
			}).pipe(Effect.provide(LiveLayer)),
		);
	});

	authErrorTests(token => callSetChatMemberTag(token, { chat_id: 0, user_id: 0 }));
});
