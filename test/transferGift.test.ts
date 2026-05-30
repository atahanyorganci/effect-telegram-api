import { describe, it } from "@effect/vitest";
import * as Effect from "effect/Effect";
import * as Telegram from "../src/index.ts";
import { authErrorTests, expectErrorTag, LiveLayer, requireBotToken } from "./helpers.ts";

const callTransferGift = (token: string, payload: unknown) =>
	Telegram.Client.callMethod(token, Telegram.Methods.transferGift, payload);

describe("transferGift", () => {
	describe("Telegram API errors", () => {
		it.effect("ChatIdentifierEmpty when required parameters missing", () =>
			Effect.gen(function* () {
				const error = yield* callTransferGift(requireBotToken(), {}).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.ChatIdentifierEmpty>(
					error,
					"ChatIdentifierEmpty",
					"Bad Request: chat identifier is empty",
				);
			}).pipe(Effect.provide(LiveLayer)),
		);
	});

	authErrorTests(token =>
		callTransferGift(token, { business_connection_id: "invalid", owned_gift_id: "invalid", new_owner_chat_id: 0 }),
	);
});
