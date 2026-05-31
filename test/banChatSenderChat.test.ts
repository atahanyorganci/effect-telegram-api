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

const callBanChatSenderChat = (token: string, payload: unknown) =>
	callClient("banChatSenderChat", token, payload as never);

liveTests("banChatSenderChat", test => {
	describe("Telegram API errors", () => {
		test.effect("ParticipantIdInvalid when sender_chat_id is invalid", () =>
			Effect.gen(function* () {
				const { botToken, groupId } = yield* telegramConfig;
				const error = yield* callBanChatSenderChat(botToken, {
					chat_id: groupId,
					sender_chat_id: 1,
				}).pipe(Effect.flip);

				expectErrorTag(error, "ParticipantIdInvalid", "Bad Request: PARTICIPANT_ID_INVALID");
			}),
		);

		test.effect("SenderChatIdEmpty when sender_chat_id is missing", () =>
			Effect.gen(function* () {
				const { botToken, groupId } = yield* telegramConfig;
				yield* expectClientSchemaError(callBanChatSenderChat(botToken, { chat_id: groupId }));
			}),
		);
	});

	authErrorTests(test, token => callBanChatSenderChat(token, { chat_id: 1, sender_chat_id: 1 }));
});
