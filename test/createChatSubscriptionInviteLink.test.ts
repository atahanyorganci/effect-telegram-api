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

const callCreateChatSubscriptionInviteLink = (token: string, payload: unknown) =>
	callClient("createChatSubscriptionInviteLink", token, payload as never);

liveTests("createChatSubscriptionInviteLink", test => {
	describe("Telegram API errors", () => {
		test.effect("CantInviteMembersToPrivateChat when chat_id is a private chat", () =>
			Effect.gen(function* () {
				const { botToken, chatId } = yield* telegramConfig;
				const error = yield* callCreateChatSubscriptionInviteLink(botToken, {
					chat_id: chatId,
					subscription_period: 30,
					subscription_price: 100,
				}).pipe(Effect.flip);

				expectErrorTag(error, "BadRequest", "Bad Request: can't invite members to a private chat");
			}),
		);

		test.effect("PricingChatInvalid when the supergroup does not support subscription pricing", () =>
			Effect.gen(function* () {
				const { botToken, groupId } = yield* telegramConfig;
				const error = yield* callCreateChatSubscriptionInviteLink(botToken, {
					chat_id: groupId,
					subscription_period: 30,
					subscription_price: 100,
				}).pipe(Effect.flip);

				expectErrorTag(error, "BadRequest", "Bad Request: PRICING_CHAT_INVALID");
			}),
		);

		test.effect("ChatIdEmpty when required parameters missing", () =>
			Effect.gen(function* () {
				const { botToken } = yield* telegramConfig;
				yield* expectClientSchemaError(callCreateChatSubscriptionInviteLink(botToken, {}));
			}),
		);
	});

	authErrorTests(test, token =>
		callCreateChatSubscriptionInviteLink(token, { chat_id: 0, subscription_period: 30, subscription_price: 1 }),
	);
});
