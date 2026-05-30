import { describe, it } from "@effect/vitest";
import * as Effect from "effect/Effect";
import * as Telegram from "../src/index.ts";
import { authErrorTests, expectErrorTag, LiveLayer, telegramConfig } from "./helpers.ts";

const callGetBusinessConnection = (token: string, payload: unknown) =>
	Telegram.Client.callMethod(token, Telegram.Methods.getBusinessConnection, payload);

describe("getBusinessConnection", () => {
	describe("Telegram API errors", () => {
		it.effect("BusinessConnectionNotFound when required parameters missing", () =>
			Effect.gen(function* () {
				const { botToken } = yield* telegramConfig;
				const error = yield* callGetBusinessConnection(botToken, {}).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.BusinessConnectionNotFound>(
					error,
					"BusinessConnectionNotFound",
					"Bad Request: business connection not found",
				);
			}).pipe(Effect.provide(LiveLayer)),
		);
	});

	authErrorTests(token => callGetBusinessConnection(token, { business_connection_id: "invalid" }));
});
