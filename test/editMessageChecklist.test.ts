import { describe } from "@effect/vitest";
import * as Effect from "effect/Effect";
import { authErrorTests, callClient, expectClientSchemaError, liveTests, telegramConfig } from "./helpers.ts";

const callEditMessageChecklist = (token: string, payload: unknown) =>
	callClient("editMessageChecklist", token, payload as never);

liveTests("editMessageChecklist", test => {
	describe("client validation", () => {
		test.effect("requires a business connection payload", () =>
			Effect.gen(function* () {
				const { botToken, chatId } = yield* telegramConfig;
				yield* expectClientSchemaError(
					callEditMessageChecklist(botToken, {
						chat_id: chatId,
						message_id: 1,
						checklist: { title: "todo", tasks: [{ id: 1, text: "item" }] },
					}),
				);
			}),
		);
	});

	authErrorTests(test, token =>
		callEditMessageChecklist(token, {
			business_connection_id: "invalid",
			chat_id: 1,
			message_id: 1,
			checklist: { title: "todo", tasks: [{ id: 1, text: "item" }] },
		}),
	);
});
