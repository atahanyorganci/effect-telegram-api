import { describe, it } from "@effect/vitest";
import * as Effect from "effect/Effect";
import * as Telegram from "../src/index.ts";
import { authErrorTests, expectErrorTag, LiveLayer, requireBotToken, requireChatId } from "./helpers.ts";

const callSetChatAdministratorCustomTitle = (token: string, payload: unknown) =>
	Telegram.Client.callMethod(token, Telegram.Methods.setChatAdministratorCustomTitle, payload);

describe("setChatAdministratorCustomTitle", () => {
	describe("Telegram API errors", () => {
		it.effect("InvalidUserId when user_id is missing", () =>
			Effect.gen(function* () {
				const error = yield* callSetChatAdministratorCustomTitle(requireBotToken(), { chat_id: requireChatId() }).pipe(
					Effect.flip,
				);

				expectErrorTag<Telegram.Errors.InvalidUserId>(error, "InvalidUserId", "Bad Request: invalid user_id specified");
			}).pipe(Effect.provide(LiveLayer)),
		);
	});

	authErrorTests(token => callSetChatAdministratorCustomTitle(token, { chat_id: 1 }));
});
