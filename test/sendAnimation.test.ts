import { describe, it } from "@effect/vitest";
import * as Effect from "effect/Effect";
import * as Telegram from "../src/index.ts";
import { authErrorTests, expectErrorTag, LiveLayer, requireBotToken, requireChatId } from "./helpers.ts";

const callSendAnimation = (token: string, payload: unknown) =>
	Telegram.Client.callMethod(token, Telegram.Methods.sendAnimation, payload);

describe("sendAnimation", () => {
	describe("Telegram API errors", () => {
		it.effect("NoAnimationInRequest when animation is missing", () =>
			Effect.gen(function* () {
				const error = yield* callSendAnimation(requireBotToken(), { chat_id: requireChatId() }).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.NoAnimationInRequest>(
					error,
					"NoAnimationInRequest",
					"Bad Request: there is no animation in the request",
				);
			}).pipe(Effect.provide(LiveLayer)),
		);
	});

	authErrorTests(token => callSendAnimation(token, { chat_id: 1 }));
});
