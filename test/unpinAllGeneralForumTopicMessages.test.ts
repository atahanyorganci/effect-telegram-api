import { describe } from "@effect/vitest";
import * as Effect from "effect/Effect";
import { authErrorTests, callClient, expectClientSchemaError, liveTests, telegramConfig } from "./helpers.ts";

const callUnpinAllGeneralForumTopicMessages = (token: string, payload: unknown) =>
	callClient("unpinAllGeneralForumTopicMessages", token, payload as never);

liveTests("unpinAllGeneralForumTopicMessages", test => {
	describe("Telegram API errors", () => {
		test.effect("ChatIdEmpty when required parameters missing", () =>
			Effect.gen(function* () {
				const { botToken } = yield* telegramConfig;
				yield* expectClientSchemaError(callUnpinAllGeneralForumTopicMessages(botToken, {}));
			}),
		);
	});

	authErrorTests(test, token => callUnpinAllGeneralForumTopicMessages(token, { chat_id: 0 }));
});
