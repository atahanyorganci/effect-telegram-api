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

const callSetChatMemberTag = (token: string, payload: unknown) =>
	callClient("setChatMemberTag", token, payload as never);

liveTests("setChatMemberTag", test => {
	describe("Telegram API errors", () => {
		test.effect("ParticipantIdInvalid when user_id is not a chat participant", () =>
			Effect.gen(function* () {
				const { botToken, groupId } = yield* telegramConfig;
				const error = yield* callSetChatMemberTag(botToken, {
					chat_id: groupId,
					user_id: 1,
					tag: "probe",
				}).pipe(Effect.flip);

				expectErrorTag(error, "ParticipantIdInvalid", "Bad Request: PARTICIPANT_ID_INVALID");
			}),
		);

		test.effect("ChatCreatorRequired when only the chat creator can set member tags", () =>
			Effect.gen(function* () {
				const { botToken, groupId, chatId } = yield* telegramConfig;
				const error = yield* callSetChatMemberTag(botToken, {
					chat_id: groupId,
					user_id: chatId,
					tag: "",
				}).pipe(Effect.flip);

				expectErrorTag(error, "ChatCreatorRequired", "Bad Request: CHAT_CREATOR_REQUIRED");
			}),
		);

		test.effect("InvalidUserId when required parameters missing", () =>
			Effect.gen(function* () {
				const { botToken } = yield* telegramConfig;
				yield* expectClientSchemaError(callSetChatMemberTag(botToken, {}));
			}),
		);
	});

	authErrorTests(test, token => callSetChatMemberTag(token, { chat_id: 0, user_id: 0 }));
});
