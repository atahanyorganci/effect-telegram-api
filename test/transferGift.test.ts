import { describe } from "@effect/vitest";
import * as Effect from "effect/Effect";
import { authErrorTests, callClient, expectClientSchemaError, liveTests, telegramConfig } from "./helpers.ts";

const callTransferGift = (token: string, payload: unknown) => callClient("transferGift", token, payload as never);

liveTests("transferGift", test => {
	describe("Telegram API errors", () => {
		test.effect("ChatIdentifierEmpty when required parameters missing", () =>
			Effect.gen(function* () {
				const { botToken } = yield* telegramConfig;
				yield* expectClientSchemaError(
					callTransferGift(botToken, {
						business_connection_id: "invalid",
						owned_gift_id: "invalid",
					}),
				);
			}),
		);
	});

	authErrorTests(test, token =>
		callTransferGift(token, { business_connection_id: "invalid", owned_gift_id: "invalid", new_owner_chat_id: 0 }),
	);
});
