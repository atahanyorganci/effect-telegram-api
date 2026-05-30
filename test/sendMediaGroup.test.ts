import { describe, it } from "@effect/vitest";
import * as Effect from "effect/Effect";
import * as Telegram from "../src/index.ts";
import { authErrorTests, expectErrorTag, LiveLayer, requireBotToken, requireChatId } from "./helpers.ts";

const callSendMediaGroup = (token: string, payload: unknown) =>
	Telegram.Client.callMethod(token, Telegram.Methods.sendMediaGroup, payload);

describe("sendMediaGroup", () => {
	describe("Telegram API errors", () => {
		it.effect("MediaRequired when media is missing", () =>
			Effect.gen(function* () {
				const error = yield* callSendMediaGroup(requireBotToken(), { chat_id: requireChatId() }).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.MediaRequired>(
					error,
					"MediaRequired",
					'Bad Request: parameter "media" is required',
				);
			}).pipe(Effect.provide(LiveLayer)),
		);
	});

	authErrorTests(token => callSendMediaGroup(token, { chat_id: 1 }));
});
