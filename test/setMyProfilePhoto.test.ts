import { describe, it } from "@effect/vitest";
import * as Effect from "effect/Effect";
import * as Telegram from "../src/index.ts";
import { authErrorTests, expectErrorTag, LiveLayer, telegramConfig } from "./helpers.ts";

const callSetMyProfilePhoto = (token: string, payload: unknown) =>
	Telegram.Client.callMethod(token, Telegram.Methods.setMyProfilePhoto, payload);

describe("setMyProfilePhoto", () => {
	describe("Telegram API errors", () => {
		it.effect("PhotoNotSpecified when required parameters missing", () =>
			Effect.gen(function* () {
				const { botToken } = yield* telegramConfig;
				const error = yield* callSetMyProfilePhoto(botToken, {}).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.PhotoNotSpecified>(
					error,
					"PhotoNotSpecified",
					"Bad Request: photo isn't specified",
				);
			}).pipe(Effect.provide(LiveLayer)),
		);
	});

	authErrorTests(token => callSetMyProfilePhoto(token, { photo: { type: "static", photo: { file_id: "invalid" } } }));
});
