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

const callRestrictChatMember = (token: string, payload: unknown) =>
	callClient("restrictChatMember", token, payload as never);

liveTests("restrictChatMember", test => {
	describe("Telegram API errors", () => {
		test.effect("ParticipantIdInvalid when user_id is not a chat participant", () =>
			Effect.gen(function* () {
				const { botToken, groupId } = yield* telegramConfig;
				const error = yield* callRestrictChatMember(botToken, {
					chat_id: groupId,
					user_id: 1,
					permissions: { can_send_messages: false },
				}).pipe(Effect.flip);

				expectErrorTag(error, "BadRequest", "Bad Request: PARTICIPANT_ID_INVALID");
			}),
		);

		test.effect("InvalidUserId when user_id is missing", () =>
			Effect.gen(function* () {
				const { botToken, chatId } = yield* telegramConfig;
				yield* expectClientSchemaError(callRestrictChatMember(botToken, { chat_id: chatId }));
			}),
		);
	});

	authErrorTests(test, token => callRestrictChatMember(token, { chat_id: 1, user_id: 1, permissions: {} }));
});
