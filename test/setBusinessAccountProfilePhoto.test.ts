import { describe, it } from "@effect/vitest";
import * as Effect from "effect/Effect";
import * as Telegram from "../src/index.ts";
import { authErrorTests, expectErrorTag, LiveLayer, telegramConfig } from "./helpers.ts";

const callSetBusinessAccountProfilePhoto = (token: string, payload: unknown) =>
	Telegram.Client.callMethod(token, Telegram.Methods.setBusinessAccountProfilePhoto, payload);

describe("setBusinessAccountProfilePhoto", () => {
	describe("Telegram API errors", () => {
		it.effect("PhotoNotSpecified when required parameters missing", () =>
			Effect.gen(function* () {
				const { botToken } = yield* telegramConfig;
				const error = yield* callSetBusinessAccountProfilePhoto(botToken, {}).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.PhotoNotSpecified>(
					error,
					"PhotoNotSpecified",
					"Bad Request: photo isn't specified",
				);
			}).pipe(Effect.provide(LiveLayer)),
		);
	});

	authErrorTests(token =>
		callSetBusinessAccountProfilePhoto(token, {
			business_connection_id: "invalid",
			photo: { type: "static", photo: { file_id: "invalid" } },
		}),
	);
});
