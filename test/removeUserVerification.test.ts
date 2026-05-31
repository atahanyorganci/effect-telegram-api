import { describe } from "@effect/vitest";
import * as Effect from "effect/Effect";
import {
	authErrorTests,
	callClient,
	expectClientSchemaError,
	expectErrorTag,
	liveTests,
	telegramConfig,
} from "./helpers.ts";

const callRemoveUserVerification = (token: string, payload: unknown) =>
	callClient("removeUserVerification", token, payload as never);

liveTests("removeUserVerification", test => {
	describe("Telegram API errors", () => {
		test.effect("PeerIdInvalid when user_id is invalid", () =>
			Effect.gen(function* () {
				const { botToken } = yield* telegramConfig;
				const error = yield* callRemoveUserVerification(botToken, { user_id: 1 }).pipe(Effect.flip);

				expectErrorTag(error, "BadRequest", "Bad Request: PEER_ID_INVALID");
			}),
		);

		test.effect("InvalidUserId when required parameters missing", () =>
			Effect.gen(function* () {
				const { botToken } = yield* telegramConfig;
				yield* expectClientSchemaError(callRemoveUserVerification(botToken, {}));
			}),
		);
	});

	authErrorTests(test, token => callRemoveUserVerification(token, { user_id: 0 }));
});
