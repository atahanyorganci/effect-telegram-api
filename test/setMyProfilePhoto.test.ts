import { describe } from "@effect/vitest";
import * as Effect from "effect/Effect";
import { authErrorTests, callClient, expectClientSchemaError, liveTests, telegramConfig } from "./helpers.ts";

const callSetMyProfilePhoto = (token: string, payload: unknown) =>
	callClient("setMyProfilePhoto", token, payload as never);

liveTests("setMyProfilePhoto", test => {
	describe("Telegram API errors", () => {
		test.effect("PhotoNotSpecified when required parameters missing", () =>
			Effect.gen(function* () {
				const { botToken } = yield* telegramConfig;
				yield* expectClientSchemaError(callSetMyProfilePhoto(botToken, {}));
			}),
		);
	});

	authErrorTests(test, token =>
		callSetMyProfilePhoto(token, { photo: { type: "static", photo: { file_id: "invalid" } } }),
	);
});
