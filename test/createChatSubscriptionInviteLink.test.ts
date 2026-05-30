import { describe, it } from "@effect/vitest";
import * as Effect from "effect/Effect";
import * as Telegram from "../src/index.ts";
import { authErrorTests, expectErrorTag, LiveLayer, telegramConfig } from "./helpers.ts";

const callCreateChatSubscriptionInviteLink = (token: string, payload: unknown) =>
	Telegram.Client.callMethod(token, Telegram.Methods.createChatSubscriptionInviteLink, payload);

describe("createChatSubscriptionInviteLink", () => {
	describe("Telegram API errors", () => {
		it.effect("CantInviteMembersToPrivateChat when chat_id is a private chat", () =>
			Effect.gen(function* () {
				const { botToken, chatId } = yield* telegramConfig;
				const error = yield* callCreateChatSubscriptionInviteLink(botToken, {
					chat_id: chatId,
					subscription_period: 30,
					subscription_price: 100,
				}).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.CantInviteMembersToPrivateChat>(
					error,
					"CantInviteMembersToPrivateChat",
					"Bad Request: can't invite members to a private chat",
				);
			}).pipe(Effect.provide(LiveLayer)),
		);

		it.effect("PricingChatInvalid when the supergroup does not support subscription pricing", () =>
			Effect.gen(function* () {
				const { botToken, groupId } = yield* telegramConfig;
				const error = yield* callCreateChatSubscriptionInviteLink(botToken, {
					chat_id: groupId,
					subscription_period: 30,
					subscription_price: 100,
				}).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.PricingChatInvalid>(
					error,
					"PricingChatInvalid",
					"Bad Request: PRICING_CHAT_INVALID",
				);
			}).pipe(Effect.provide(LiveLayer)),
		);

		it.effect("ChatIdEmpty when required parameters missing", () =>
			Effect.gen(function* () {
				const { botToken } = yield* telegramConfig;
				const error = yield* callCreateChatSubscriptionInviteLink(botToken, {}).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.ChatIdEmpty>(error, "ChatIdEmpty", "Bad Request: chat_id is empty");
			}).pipe(Effect.provide(LiveLayer)),
		);
	});

	authErrorTests(token =>
		callCreateChatSubscriptionInviteLink(token, { chat_id: 0, subscription_period: 30, subscription_price: 1 }),
	);
});
