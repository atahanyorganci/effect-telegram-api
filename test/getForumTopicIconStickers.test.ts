import { assert, describe, it } from "@effect/vitest";
import * as Effect from "effect/Effect";
import * as Telegram from "../src/index.ts";
import { authErrorTests, LiveLayer, requireBotToken } from "./helpers.ts";

const callGetForumTopicIconStickers = (token: string) =>
	Telegram.Client.callMethod(token, Telegram.Methods.getForumTopicIconStickers);

describe("getForumTopicIconStickers", () => {
	describe("success", () => {
		it.effect("returns custom emoji stickers for forum topic icons", () =>
			Effect.gen(function* () {
				const stickers = yield* callGetForumTopicIconStickers(requireBotToken());

				assert.ok(stickers.length > 0);
			}).pipe(Effect.provide(LiveLayer)),
		);
	});

	authErrorTests(callGetForumTopicIconStickers);
});
