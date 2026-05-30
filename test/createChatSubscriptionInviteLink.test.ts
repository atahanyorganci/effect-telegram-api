import { describe, it } from "@effect/vitest";
import * as Effect from "effect/Effect";
import * as Telegram from "../src/index.ts";
import { authErrorTests, expectErrorTag, LiveLayer, requireBotToken } from "./helpers.ts";

const callCreateChatSubscriptionInviteLink = (token: string, payload: unknown) =>
	Telegram.Client.callMethod(token, Telegram.Methods.createChatSubscriptionInviteLink, payload);

describe("createChatSubscriptionInviteLink", () => {
	describe("Telegram API errors", () => {
		it.effect("ChatIdEmpty when required parameters missing", () =>
			Effect.gen(function* () {
				const error = yield* callCreateChatSubscriptionInviteLink(requireBotToken(), {}).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.ChatIdEmpty>(error, "ChatIdEmpty", "Bad Request: chat_id is empty");
			}).pipe(Effect.provide(LiveLayer)),
		);
	});

	authErrorTests(token =>
		callCreateChatSubscriptionInviteLink(token, { chat_id: 0, subscription_period: 30, subscription_price: 1 }),
	);
});
