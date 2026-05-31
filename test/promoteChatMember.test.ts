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

const callPromoteChatMember = (token: string, payload: unknown) =>
	callClient("promoteChatMember", token, payload as never);

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

liveTests("promoteChatMember", test => {
	describe("Telegram API errors", () => {
		test.effect("CantRemoveChatOwner when promotion would demote the chat owner", () =>
			Effect.gen(function* () {
				const { botToken, groupId } = yield* telegramConfig;
				const administrators = yield* callClient("getChatAdministrators", botToken, {
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

				expectErrorTag(error, "BadRequest", "Bad Request: can't remove chat owner");
			}),
		);

		test.effect("InvalidUserId when user_id is missing", () =>
			Effect.gen(function* () {
				const { botToken, chatId } = yield* telegramConfig;
				yield* expectClientSchemaError(callPromoteChatMember(botToken, { chat_id: chatId }));
			}),
		);
	});

	authErrorTests(test, token => callPromoteChatMember(token, { chat_id: 1, user_id: 1 }));
});
