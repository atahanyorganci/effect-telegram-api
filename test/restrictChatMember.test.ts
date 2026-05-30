import { describe, it } from "@effect/vitest";
import * as Effect from "effect/Effect";
import * as Telegram from "../src/index.ts";
import { authErrorTests, expectErrorTag, LiveLayer, telegramConfig } from "./helpers.ts";

const callRestrictChatMember = (token: string, payload: unknown) =>
	Telegram.Client.callMethod(token, Telegram.Methods.restrictChatMember, payload);

describe("restrictChatMember", () => {
	describe("Telegram API errors", () => {
		it.effect("InvalidUserId when user_id is missing", () =>
			Effect.gen(function* () {
				const { botToken, chatId } = yield* telegramConfig;
				const error = yield* callRestrictChatMember(botToken, { chat_id: chatId }).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.InvalidUserId>(error, "InvalidUserId", "Bad Request: invalid user_id specified");
			}).pipe(Effect.provide(LiveLayer)),
		);
	});

	authErrorTests(token => callRestrictChatMember(token, { chat_id: 1 }));
});
