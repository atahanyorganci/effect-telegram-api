import { describe } from "@effect/vitest";
import * as Effect from "effect/Effect";
import {
	authErrorTests,
	callClient,
	expectClientSchemaError,
	expectErrorTag,
	liveTests,
	telegramConfig,
} from "./helpers.ts";

const callSetChatAdministratorCustomTitle = (token: string, payload: unknown) =>
	callClient("setChatAdministratorCustomTitle", token, payload as never);

liveTests("setChatAdministratorCustomTitle", test => {
	describe("Telegram API errors", () => {
		test.effect("ParticipantIdInvalid when user_id is not a chat participant", () =>
			Effect.gen(function* () {
				const { botToken, groupId } = yield* telegramConfig;
				const error = yield* callSetChatAdministratorCustomTitle(botToken, {
					chat_id: groupId,
					user_id: 1,
					custom_title: "probe",
				}).pipe(Effect.flip);

				expectErrorTag(error, "ParticipantIdInvalid", "Bad Request: PARTICIPANT_ID_INVALID");
			}),
		);

		test.effect("InvalidUserId when user_id is missing", () =>
			Effect.gen(function* () {
				const { botToken, chatId } = yield* telegramConfig;
				yield* expectClientSchemaError(callSetChatAdministratorCustomTitle(botToken, { chat_id: chatId }));
			}),
		);
	});

	authErrorTests(test, token =>
		callSetChatAdministratorCustomTitle(token, { chat_id: 1, user_id: 1, custom_title: "test" }),
	);
});
