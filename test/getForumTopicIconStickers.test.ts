import { assert, describe } from "@effect/vitest";
import * as Effect from "effect/Effect";
import { authErrorTests, callClient, liveTests, telegramConfig } from "./helpers.ts";

const callGetForumTopicIconStickers = (token: string) => callClient("getForumTopicIconStickers", token);

liveTests("getForumTopicIconStickers", test => {
	describe("success", () => {
		test.effect("returns custom emoji stickers for forum topic icons", () =>
			Effect.gen(function* () {
				const { botToken } = yield* telegramConfig;
				const stickers = yield* callGetForumTopicIconStickers(botToken);

				assert.ok(stickers.length > 0);
			}),
		);
	});

	authErrorTests(test, token => callGetForumTopicIconStickers(token));
});
