import { describe, it } from "@effect/vitest";
import * as Effect from "effect/Effect";
import * as Telegram from "../src/index.ts";
import { authErrorTests, expectErrorTag, LiveLayer, telegramConfig } from "./helpers.ts";

const callApproveChatJoinRequest = (token: string, payload: unknown) =>
	Telegram.Client.callMethod(token, Telegram.Methods.approveChatJoinRequest, payload);

describe("approveChatJoinRequest", () => {
	describe("Telegram API errors", () => {
		it.effect("UserIdInvalid when user_id does not refer to a pending join request", () =>
			Effect.gen(function* () {
				const { botToken, groupId } = yield* telegramConfig;
				const error = yield* callApproveChatJoinRequest(botToken, {
					chat_id: groupId,
					user_id: 1,
				}).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.UserIdInvalid>(error, "UserIdInvalid", "Bad Request: USER_ID_INVALID");
			}).pipe(Effect.provide(LiveLayer)),
		);

		it.effect("InvalidUserId when required parameters missing", () =>
			Effect.gen(function* () {
				const { botToken } = yield* telegramConfig;
				const error = yield* callApproveChatJoinRequest(botToken, {}).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.InvalidUserId>(error, "InvalidUserId", "Bad Request: invalid user_id specified");
			}).pipe(Effect.provide(LiveLayer)),
		);
	});

	authErrorTests(token => callApproveChatJoinRequest(token, { chat_id: 0, user_id: 0 }));
});
