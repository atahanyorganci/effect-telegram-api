import { describe } from "@effect/vitest";
import * as Effect from "effect/Effect";
import { authErrorTests, callClient, expectClientSchemaError, liveTests, telegramConfig } from "./helpers.ts";

const callSendChecklist = (token: string, payload: unknown) => callClient("sendChecklist", token, payload as never);

liveTests("sendChecklist", test => {
	describe("Telegram API errors", () => {
		test.effect("ChecklistRequired when checklist is missing", () =>
			Effect.gen(function* () {
				const { botToken, chatId } = yield* telegramConfig;
				yield* expectClientSchemaError(
					callSendChecklist(botToken, { business_connection_id: "invalid", chat_id: chatId }),
				);
			}),
		);
	});

	authErrorTests(test, token =>
		callSendChecklist(token, {
			business_connection_id: "invalid",
			chat_id: 1,
			checklist: { title: "t", tasks: [{ id: 1, text: "t" }] },
		}),
	);
});
