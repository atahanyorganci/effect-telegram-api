import { describe } from "@effect/vitest";
import * as Effect from "effect/Effect";
import { authErrorTests, callClient, expectClientSchemaError, liveTests, telegramConfig } from "./helpers.ts";

const callSetBusinessAccountProfilePhoto = (token: string, payload: unknown) =>
	callClient("setBusinessAccountProfilePhoto", token, payload as never);

liveTests("setBusinessAccountProfilePhoto", test => {
	describe("Telegram API errors", () => {
		test.effect("PhotoNotSpecified when required parameters missing", () =>
			Effect.gen(function* () {
				const { botToken } = yield* telegramConfig;
				yield* expectClientSchemaError(
					callSetBusinessAccountProfilePhoto(botToken, { business_connection_id: "invalid" }),
				);
			}),
		);
	});

	authErrorTests(test, token =>
		callSetBusinessAccountProfilePhoto(token, {
			business_connection_id: "invalid",
			photo: { type: "static", photo: { file_id: "invalid" } },
		}),
	);
});
