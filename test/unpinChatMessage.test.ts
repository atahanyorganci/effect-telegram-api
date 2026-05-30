import { describe, it } from "@effect/vitest";
import * as Effect from "effect/Effect";
import * as Telegram from "../src/index.ts";
import { authErrorTests, expectErrorTag, LiveLayer, requireBotToken, requireChatId } from "./helpers.ts";

const callUnpinChatMessage = (token: string, payload: unknown) =>
	Telegram.Client.callMethod(token, Telegram.Methods.unpinChatMessage, payload);

describe("unpinChatMessage", () => {
	describe("Telegram API errors", () => {
		it.effect("MessageToUnpinNotFound when message_id is missing", () =>
			Effect.gen(function* () {
				const error = yield* callUnpinChatMessage(requireBotToken(), { chat_id: requireChatId() }).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.MessageToUnpinNotFound>(
					error,
					"MessageToUnpinNotFound",
					"Bad Request: message to unpin not found",
				);
			}).pipe(Effect.provide(LiveLayer)),
		);

		it.effect("MessageToUnpinNotFound when message_id does not exist", () =>
			Effect.gen(function* () {
				const error = yield* callUnpinChatMessage(requireBotToken(), {
					chat_id: requireChatId(),
					message_id: 999_999_999,
				}).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.MessageToUnpinNotFound>(
					error,
					"MessageToUnpinNotFound",
					"Bad Request: message to unpin not found",
				);
			}).pipe(Effect.provide(LiveLayer)),
		);
	});

	authErrorTests(token => callUnpinChatMessage(token, { chat_id: 1, message_id: 1 }));
});
