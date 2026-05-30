import { describe, it } from "@effect/vitest";
import * as Effect from "effect/Effect";
import * as Telegram from "../src/index.ts";
import { authErrorTests, expectErrorTag, LiveLayer, requireBotToken, requireChatId } from "./helpers.ts";

const callBanChatMember = (token: string, payload: unknown) =>
	Telegram.Client.callMethod(token, Telegram.Methods.banChatMember, payload);

describe("banChatMember", () => {
	describe("Telegram API errors", () => {
		it.effect("InvalidUserId when user_id is missing", () =>
			Effect.gen(function* () {
				const error = yield* callBanChatMember(requireBotToken(), { chat_id: requireChatId() }).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.InvalidUserId>(error, "InvalidUserId", "Bad Request: invalid user_id specified");
			}).pipe(Effect.provide(LiveLayer)),
		);
	});

	authErrorTests(token => callBanChatMember(token, { chat_id: 1, user_id: 1 }));
});
