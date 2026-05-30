import { describe, it } from "@effect/vitest";
import * as Effect from "effect/Effect";
import * as Telegram from "../src/index.ts";
import { authErrorTests, expectErrorTag, LiveLayer, requireBotToken } from "./helpers.ts";

const callTransferBusinessAccountStars = (token: string, payload: unknown) =>
	Telegram.Client.callMethod(token, Telegram.Methods.transferBusinessAccountStars, payload);

describe("transferBusinessAccountStars", () => {
	describe("Telegram API errors", () => {
		it.effect("BusinessConnectionNotFound when required parameters missing", () =>
			Effect.gen(function* () {
				const error = yield* callTransferBusinessAccountStars(requireBotToken(), {}).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.BusinessConnectionNotFound>(
					error,
					"BusinessConnectionNotFound",
					"Bad Request: business connection not found",
				);
			}).pipe(Effect.provide(LiveLayer)),
		);
	});

	authErrorTests(token =>
		callTransferBusinessAccountStars(token, { business_connection_id: "invalid", star_count: 1 }),
	);
});
