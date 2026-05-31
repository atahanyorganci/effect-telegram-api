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

const callApproveChatJoinRequest = (token: string, payload: unknown) =>
	callClient("approveChatJoinRequest", token, payload as never);

liveTests("approveChatJoinRequest", test => {
	describe("Telegram API errors", () => {
		test.effect("UserIdInvalid when user_id does not refer to a pending join request", () =>
			Effect.gen(function* () {
				const { botToken, groupId } = yield* telegramConfig;
				const error = yield* callApproveChatJoinRequest(botToken, {
					chat_id: groupId,
					user_id: 1,
				}).pipe(Effect.flip);

				expectErrorTag(error, "BadRequest", "Bad Request: USER_ID_INVALID");
			}),
		);

		test.effect("InvalidUserId when required parameters missing", () =>
			Effect.gen(function* () {
				const { botToken } = yield* telegramConfig;
				yield* expectClientSchemaError(callApproveChatJoinRequest(botToken, {}));
			}),
		);
	});

	authErrorTests(test, token => callApproveChatJoinRequest(token, { chat_id: 0, user_id: 0 }));
});
