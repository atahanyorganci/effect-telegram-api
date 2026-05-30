import { NodeHttpClient, NodeServices } from "@effect/platform-node";
import { assert } from "@effect/vitest";
import * as Layer from "effect/Layer";
import type { TelegramApiError } from "../src/Client.ts";

export const LiveLayer = Layer.mergeAll(NodeServices.layer, NodeHttpClient.layerFetch);

export const requireBotToken = (): string => {
	const token = process.env.TELEGRAM_BOT_TOKEN;
	if (token === undefined || token === "") {
		assert.fail("TELEGRAM_BOT_TOKEN is not set (add it to .env)");
	}
	return token;
};

/** Numeric id or @username string for sendMessage / getChat success tests. */
export const requireChatId = (): number | string => {
	const raw = process.env.TELEGRAM_CHAT_ID;
	if (raw === undefined || raw === "") {
		assert.fail("TELEGRAM_CHAT_ID is not set (add it to .env — your user id or @channelusername)");
	}
	const parsed = Number(raw);
	return Number.isFinite(parsed) ? parsed : raw;
};

export const expectTelegramApiError = (
	error: unknown,
	expected: { readonly errorCode: number; readonly description: string },
) => {
	assert.strictEqual((error as TelegramApiError)._tag, "TelegramApiError");
	assert.strictEqual((error as TelegramApiError).errorCode, expected.errorCode);
	assert.strictEqual((error as TelegramApiError).description, expected.description);
};

export const expectErrorTag = <T extends { readonly _tag: string; readonly description: string }>(
	error: unknown,
	tag: T["_tag"],
	description: string,
) => {
	assert.strictEqual((error as T)._tag, tag);
	assert.strictEqual((error as T).description, description);
};
