import { assert, describe } from "@effect/vitest";
import * as Effect from "effect/Effect";
import {
	authErrorTests,
	callClient,
	expectClientSchemaError,
	expectErrorTag,
	liveTests,
	telegramConfig,
} from "./helpers.ts";

const callSetChatDescription = (token: string, payload: unknown) =>
	callClient("setChatDescription", token, payload as never);

liveTests("setChatDescription", test => {
	describe("success", () => {
		test.effect("returns true when updating and restoring the supergroup description", () =>
			Effect.gen(function* () {
				const { botToken, groupId } = yield* telegramConfig;
				const chat = yield* callClient("getChat", botToken, { chat_id: groupId });
				const original = "description" in chat && typeof chat.description === "string" ? chat.description : "";

				yield* callSetChatDescription(botToken, {
					chat_id: groupId,
					description: `${original} integration-test`,
				});
				const result = yield* callSetChatDescription(botToken, {
					chat_id: groupId,
					description: original,
				});

				assert.strictEqual(result, true);
			}),
		);
	});

	describe("Telegram API errors", () => {
		test.effect("CantChangePrivateChatDescription when chat_id is a private chat", () =>
			Effect.gen(function* () {
				const { botToken, chatId } = yield* telegramConfig;
				const error = yield* callSetChatDescription(botToken, {
					chat_id: chatId,
					description: "probe",
				}).pipe(Effect.flip);

				expectErrorTag(error, "CantChangePrivateChatDescription", "Bad Request: can't change private chat description");
			}),
		);

		test.effect("ChatIdEmpty when required parameters missing", () =>
			Effect.gen(function* () {
				const { botToken } = yield* telegramConfig;
				yield* expectClientSchemaError(callSetChatDescription(botToken, {}));
			}),
		);
	});

	authErrorTests(test, token => callSetChatDescription(token, { chat_id: 0 }));
});
