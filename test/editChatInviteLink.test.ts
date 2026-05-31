import { describe } from "@effect/vitest";
import * as Effect from "effect/Effect";
import {
	authErrorTests,
	callClient,
	expectClientSchemaError,
	expectErrorTag,
	liveTests,
	telegramConfig,
} from "./helpers.ts";

const callEditChatInviteLink = (token: string, payload: unknown) =>
	callClient("editChatInviteLink", token, payload as never);

liveTests("editChatInviteLink", test => {
	describe("Telegram API errors", () => {
		test.effect("InviteHashExpired when invite_link is invalid", () =>
			Effect.gen(function* () {
				const { botToken, groupId } = yield* telegramConfig;
				const error = yield* callEditChatInviteLink(botToken, {
					chat_id: groupId,
					invite_link: "https://t.me/+bogus",
					name: "probe",
				}).pipe(Effect.flip);

				expectErrorTag(error, "BadRequest", "Bad Request: INVITE_HASH_EXPIRED");
			}),
		);

		test.effect("ChatIdEmpty when required parameters missing", () =>
			Effect.gen(function* () {
				const { botToken } = yield* telegramConfig;
				yield* expectClientSchemaError(callEditChatInviteLink(botToken, {}));
			}),
		);
	});

	authErrorTests(test, token => callEditChatInviteLink(token, { chat_id: 0, invite_link: "https://t.me/+invalid" }));
});
