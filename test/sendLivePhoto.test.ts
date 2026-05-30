import { describe, it } from "@effect/vitest";
import * as Effect from "effect/Effect";
import * as Telegram from "../src/index.ts";
import { authErrorTests, expectErrorTag, LiveLayer, requireBotToken, requireChatId } from "./helpers.ts";

const callSendLivePhoto = (token: string, payload: unknown) =>
	Telegram.Client.callMethod(token, Telegram.Methods.sendLivePhoto, payload);

describe("sendLivePhoto", () => {
	describe("Telegram API errors", () => {
		it.effect("NoLivePhotoInRequest when live photo is missing", () =>
			Effect.gen(function* () {
				const error = yield* callSendLivePhoto(requireBotToken(), { chat_id: requireChatId() }).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.NoLivePhotoInRequest>(
					error,
					"NoLivePhotoInRequest",
					"Bad Request: there is no live photo in the request",
				);
			}).pipe(Effect.provide(LiveLayer)),
		);
	});

	authErrorTests(token => callSendLivePhoto(token, { chat_id: 1 }));
});
