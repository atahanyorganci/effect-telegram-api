import { describe, it } from "@effect/vitest";
import * as Effect from "effect/Effect";
import * as Telegram from "../src/index.ts";
import { authErrorTests, expectErrorTag, LiveLayer, requireBotToken } from "./helpers.ts";

const callDeleteBusinessMessages = (token: string, payload: unknown) =>
	Telegram.Client.callMethod(token, Telegram.Methods.deleteBusinessMessages, payload);

describe("deleteBusinessMessages", () => {
	describe("Telegram API errors", () => {
		it.effect("MessageIdentifiersAreNotSpecified when required parameters missing", () =>
			Effect.gen(function* () {
				const error = yield* callDeleteBusinessMessages(requireBotToken(), {}).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.MessageIdentifiersAreNotSpecified>(
					error,
					"MessageIdentifiersAreNotSpecified",
					"Bad Request: message identifiers are not specified",
				);
			}).pipe(Effect.provide(LiveLayer)),
		);
	});

	authErrorTests(token => callDeleteBusinessMessages(token, { business_connection_id: "invalid", message_ids: [0] }));
});
