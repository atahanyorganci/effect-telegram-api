import { describe, it } from "@effect/vitest";
import * as Effect from "effect/Effect";
import * as Telegram from "../src/index.ts";
import { authErrorTests, expectErrorTag, LiveLayer, telegramConfig } from "./helpers.ts";

const callPromoteChatMember = (token: string, payload: unknown) =>
	Telegram.Client.callMethod(token, Telegram.Methods.promoteChatMember, payload);

const isChatOwner = (
	admin: unknown,
): admin is { readonly status: "creator"; readonly user: { readonly id: number } } => {
	if (admin === null || typeof admin !== "object") {
		return false;
	}
	const candidate = admin as { readonly status?: unknown; readonly user?: unknown };
	if (candidate.status !== "creator" || candidate.user === null || typeof candidate.user !== "object") {
		return false;
	}
	return typeof (candidate.user as { readonly id?: unknown }).id === "number";
};

describe("promoteChatMember", () => {
	describe("Telegram API errors", () => {
		it.effect("CantRemoveChatOwner when promotion would demote the chat owner", () =>
			Effect.gen(function* () {
				const { botToken, groupId } = yield* telegramConfig;
				const administrators = yield* Telegram.Client.callMethod(botToken, Telegram.Methods.getChatAdministrators, {
					chat_id: groupId,
				});
				const owner = administrators.find(isChatOwner);
				if (owner === undefined) {
					return yield* Effect.die("expected a creator in getChatAdministrators");
				}

				const error = yield* callPromoteChatMember(botToken, {
					chat_id: groupId,
					user_id: owner.user.id,
					can_delete_messages: true,
				}).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.CantRemoveChatOwner>(
					error,
					"CantRemoveChatOwner",
					"Bad Request: can't remove chat owner",
				);
			}).pipe(Effect.provide(LiveLayer)),
		);

		it.effect("InvalidUserId when user_id is missing", () =>
			Effect.gen(function* () {
				const { botToken, chatId } = yield* telegramConfig;
				const error = yield* callPromoteChatMember(botToken, { chat_id: chatId }).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.InvalidUserId>(error, "InvalidUserId", "Bad Request: invalid user_id specified");
			}).pipe(Effect.provide(LiveLayer)),
		);
	});

	authErrorTests(token => callPromoteChatMember(token, { chat_id: 1 }));
});
