import { describe } from "@effect/vitest";
import * as Effect from "effect/Effect";
import { authErrorTests, callClient, expectErrorTag, liveTests, telegramConfig } from "./helpers.ts";

const callTransferBusinessAccountStars = (token: string, payload: unknown) =>
	callClient("transferBusinessAccountStars", token, payload as never);

liveTests("transferBusinessAccountStars", test => {
	describe("Telegram API errors", () => {
		test.effect("BusinessConnectionNotFound when required parameters missing", () =>
			Effect.gen(function* () {
				const { botToken } = yield* telegramConfig;
				const error = yield* callTransferBusinessAccountStars(botToken, {
					business_connection_id: "invalid",
					star_count: 1,
				}).pipe(Effect.flip);

				expectErrorTag(error, "BadRequest", "Bad Request: business connection not found");
			}),
		);
	});

	authErrorTests(test, token =>
		callTransferBusinessAccountStars(token, { business_connection_id: "invalid", star_count: 1 }),
	);
});
