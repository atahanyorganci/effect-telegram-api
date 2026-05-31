import { describe } from "@effect/vitest";
import * as Effect from "effect/Effect";
import { authErrorTests, callClient, expectClientSchemaError, liveTests, telegramConfig } from "./helpers.ts";

const callDeleteBusinessMessages = (token: string, payload: unknown) =>
	callClient("deleteBusinessMessages", token, payload as never);

liveTests("deleteBusinessMessages", test => {
	describe("Telegram API errors", () => {
		test.effect("MessageIdentifiersAreNotSpecified when required parameters missing", () =>
			Effect.gen(function* () {
				const { botToken } = yield* telegramConfig;
				yield* expectClientSchemaError(callDeleteBusinessMessages(botToken, {}));
			}),
		);
	});

	authErrorTests(test, token =>
		callDeleteBusinessMessages(token, { business_connection_id: "invalid", message_ids: [0] }),
	);
});
