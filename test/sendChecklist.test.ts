import { describe, it } from "@effect/vitest";
import * as Effect from "effect/Effect";
import * as Telegram from "../src/index.ts";
import { authErrorTests, expectErrorTag, LiveLayer, telegramConfig } from "./helpers.ts";

const callSendChecklist = (token: string, payload: unknown) =>
	Telegram.Client.callMethod(token, Telegram.Methods.sendChecklist, payload);

describe("sendChecklist", () => {
	describe("Telegram API errors", () => {
		it.effect("ChecklistRequired when checklist is missing", () =>
			Effect.gen(function* () {
				const { botToken, chatId } = yield* telegramConfig;
				const error = yield* callSendChecklist(botToken, { chat_id: chatId }).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.ChecklistRequired>(
					error,
					"ChecklistRequired",
					'Bad Request: parameter "checklist" is required',
				);
			}).pipe(Effect.provide(LiveLayer)),
		);
	});

	authErrorTests(token => callSendChecklist(token, { chat_id: 1 }));
});
