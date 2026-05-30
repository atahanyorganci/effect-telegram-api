import { describe, it } from "@effect/vitest";
import * as Effect from "effect/Effect";
import * as Telegram from "../src/index.ts";
import { authErrorTests, expectErrorTag, LiveLayer, requireBotToken, requireChatId } from "./helpers.ts";

const callSetMessageReaction = (token: string, payload: unknown) =>
	Telegram.Client.callMethod(token, Telegram.Methods.setMessageReaction, payload);

describe("setMessageReaction", () => {
	describe("Telegram API errors", () => {
		it.effect("MessageToReactNotFound when message_id is missing", () =>
			Effect.gen(function* () {
				const error = yield* callSetMessageReaction(requireBotToken(), {
					chat_id: requireChatId(),
					reaction: [],
				}).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.MessageToReactNotFound>(
					error,
					"MessageToReactNotFound",
					"Bad Request: message to react not found",
				);
			}).pipe(Effect.provide(LiveLayer)),
		);

		it.effect("MessageToReactNotFound when message_id does not exist", () =>
			Effect.gen(function* () {
				const error = yield* callSetMessageReaction(requireBotToken(), {
					chat_id: requireChatId(),
					message_id: 999_999_999,
					reaction: [],
				}).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.MessageToReactNotFound>(
					error,
					"MessageToReactNotFound",
					"Bad Request: message to react not found",
				);
			}).pipe(Effect.provide(LiveLayer)),
		);
	});

	authErrorTests(token => callSetMessageReaction(token, { chat_id: 1, message_id: 1, reaction: [] }));
});
