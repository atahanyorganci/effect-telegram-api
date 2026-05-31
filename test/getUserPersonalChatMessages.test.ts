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

const callGetUserPersonalChatMessages = (token: string, payload: unknown) =>
	callClient("getUserPersonalChatMessages", token, payload as never);

liveTests("getUserPersonalChatMessages", test => {
	describe("Telegram API errors", () => {
		test.effect("LimitMustBePositive when limit is zero", () =>
			Effect.gen(function* () {
				const { botToken, chatId } = yield* telegramConfig;
				const error = yield* callGetUserPersonalChatMessages(botToken, {
					user_id: chatId,
					limit: 0,
				}).pipe(Effect.flip);

				expectErrorTag(error, "LimitMustBePositive", "Bad Request: limit must be positive");
			}),
		);

		test.effect("InvalidUserId when required parameters missing", () =>
			Effect.gen(function* () {
				const { botToken } = yield* telegramConfig;
				yield* expectClientSchemaError(callGetUserPersonalChatMessages(botToken, {}));
			}),
		);
	});

	authErrorTests(test, token => callGetUserPersonalChatMessages(token, { user_id: 0, limit: 1 }));
});
