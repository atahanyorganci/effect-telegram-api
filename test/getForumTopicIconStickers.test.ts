import { assert, describe, it } from "@effect/vitest";
import * as Effect from "effect/Effect";
import * as Telegram from "../src/index.ts";
import { LiveLayer, requireBotToken } from "./helpers.ts";

describe("getForumTopicIconStickers", () => {
	describe("success", () => {
		it.effect("returns custom emoji stickers for forum topic icons", () =>
			Effect.gen(function* () {
				const stickers = yield* Telegram.Client.callMethod(
					requireBotToken(),
					Telegram.Methods.getForumTopicIconStickers,
				);

				assert.ok(stickers.length > 0);
			}).pipe(Effect.provide(LiveLayer)),
		);
	});
});
