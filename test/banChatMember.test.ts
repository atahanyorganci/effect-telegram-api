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

const callBanChatMember = (token: string, payload: unknown) => callClient("banChatMember", token, payload as never);

liveTests("banChatMember", test => {
	describe("Telegram API errors", () => {
		test.effect("InvalidUserId when user_id is missing", () =>
			Effect.gen(function* () {
				const { botToken, chatId } = yield* telegramConfig;
				yield* expectClientSchemaError(callBanChatMember(botToken, { chat_id: chatId }));
			}),
		);

		test.effect("ParticipantIdInvalid when user_id is not a chat participant", () =>
			Effect.gen(function* () {
				const { botToken, groupId } = yield* telegramConfig;
				const error = yield* callBanChatMember(botToken, { chat_id: groupId, user_id: 1 }).pipe(Effect.flip);

				expectErrorTag(error, "ParticipantIdInvalid", "Bad Request: PARTICIPANT_ID_INVALID");
			}),
		);
	});

	authErrorTests(test, token => callBanChatMember(token, { chat_id: 1, user_id: 1 }));
});
