import { describe, it } from "@effect/vitest";
import * as Effect from "effect/Effect";
import * as Telegram from "../src/index.ts";
import { authErrorTests, expectErrorTag, LiveLayer, requireBotToken } from "./helpers.ts";

const callSetBusinessAccountUsername = (token: string, payload: unknown) =>
	Telegram.Client.callMethod(token, Telegram.Methods.setBusinessAccountUsername, payload);

describe("setBusinessAccountUsername", () => {
	describe("Telegram API errors", () => {
		it.effect("BusinessConnectionNotFound when required parameters missing", () =>
			Effect.gen(function* () {
				const error = yield* callSetBusinessAccountUsername(requireBotToken(), {}).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.BusinessConnectionNotFound>(
					error,
					"BusinessConnectionNotFound",
					"Bad Request: business connection not found",
				);
			}).pipe(Effect.provide(LiveLayer)),
		);
	});

	authErrorTests(token => callSetBusinessAccountUsername(token, { business_connection_id: "invalid" }));
});
