import { describe } from "@effect/vitest";
import * as Effect from "effect/Effect";
import { authErrorTests, callClient, expectClientSchemaError, liveTests, telegramConfig } from "./helpers.ts";

const callSetChatPhoto = (token: string, payload: unknown = {}) => callClient("setChatPhoto", token, payload as never);

liveTests("setChatPhoto", test => {
	describe("payload validation", () => {
		test.effect("fails Schema encode when photo is missing", () =>
			Effect.gen(function* () {
				const { botToken, chatId } = yield* telegramConfig;
				yield* expectClientSchemaError(callSetChatPhoto(botToken, { chat_id: chatId }));
			}),
		);
	});

	authErrorTests(test, token => callSetChatPhoto(token, { chat_id: 1, photo: new Uint8Array([0]) }));
});
