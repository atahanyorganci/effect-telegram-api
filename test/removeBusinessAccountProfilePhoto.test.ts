import { describe, it } from "@effect/vitest";
import * as Effect from "effect/Effect";
import * as Telegram from "../src/index.ts";
import { authErrorTests, expectErrorTag, LiveLayer, telegramConfig } from "./helpers.ts";

const callRemoveBusinessAccountProfilePhoto = (token: string, payload: unknown) =>
	Telegram.Client.callMethod(token, Telegram.Methods.removeBusinessAccountProfilePhoto, payload);

describe("removeBusinessAccountProfilePhoto", () => {
	describe("Telegram API errors", () => {
		it.effect("BusinessConnectionNotFound when validation fails", () =>
			Effect.gen(function* () {
				const { botToken } = yield* telegramConfig;
				const error = yield* callRemoveBusinessAccountProfilePhoto(botToken, {}).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.BusinessConnectionNotFound>(
					error,
					"BusinessConnectionNotFound",
					"Bad Request: business connection not found",
				);
			}).pipe(Effect.provide(LiveLayer)),
		);
	});

	authErrorTests(token => callRemoveBusinessAccountProfilePhoto(token, {}));
});
