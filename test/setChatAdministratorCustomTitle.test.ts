import { describe, it } from "@effect/vitest";
import * as Effect from "effect/Effect";
import * as Telegram from "../src/index.ts";
import { authErrorTests, expectErrorTag, LiveLayer, telegramConfig } from "./helpers.ts";

const callSetChatAdministratorCustomTitle = (token: string, payload: unknown) =>
	Telegram.Client.callMethod(token, Telegram.Methods.setChatAdministratorCustomTitle, payload);

describe("setChatAdministratorCustomTitle", () => {
	describe("Telegram API errors", () => {
		it.effect("ParticipantIdInvalid when user_id is not a chat participant", () =>
			Effect.gen(function* () {
				const { botToken, groupId } = yield* telegramConfig;
				const error = yield* callSetChatAdministratorCustomTitle(botToken, {
					chat_id: groupId,
					user_id: 1,
					custom_title: "probe",
				}).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.ParticipantIdInvalid>(
					error,
					"ParticipantIdInvalid",
					"Bad Request: PARTICIPANT_ID_INVALID",
				);
			}).pipe(Effect.provide(LiveLayer)),
		);

		it.effect("InvalidUserId when user_id is missing", () =>
			Effect.gen(function* () {
				const { botToken, chatId } = yield* telegramConfig;
				const error = yield* callSetChatAdministratorCustomTitle(botToken, { chat_id: chatId }).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.InvalidUserId>(error, "InvalidUserId", "Bad Request: invalid user_id specified");
			}).pipe(Effect.provide(LiveLayer)),
		);
	});

	authErrorTests(token => callSetChatAdministratorCustomTitle(token, { chat_id: 1 }));
});
