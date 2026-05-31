import { assert, describe } from "@effect/vitest";
import * as Effect from "effect/Effect";
import { readFileSync } from "node:fs";
import { authErrorTests, callClient, expectErrorTag, formDataPayload, liveTests, telegramConfig } from "./helpers.ts";

const readVideoFixture = () => readFileSync(new URL("./video.mp4", import.meta.url));

const callSendVideo = (token: string, payload: unknown = {}) =>
	callClient("sendVideo", token, formDataPayload(payload as Record<string, unknown>) as never);

liveTests("sendVideo", test => {
	describe("success", () => {
		test.effect("sends a local video fixture", () =>
			Effect.gen(function* () {
				const { botToken, chatId } = yield* telegramConfig;
				const message = yield* callSendVideo(botToken, {
					chat_id: chatId,
					video: readVideoFixture(),
					caption: "sendVideo integration test",
				});

				assert.strictEqual(typeof message.message_id, "number");
				assert.strictEqual(message.caption, "sendVideo integration test");
				assert.isDefined(message.video);
			}),
		);

		test.effect("resends an uploaded video by file_id", () =>
			Effect.gen(function* () {
				const { botToken, chatId } = yield* telegramConfig;
				const first = yield* callSendVideo(botToken, {
					chat_id: chatId,
					video: readVideoFixture(),
				});
				const fileId = first.video?.file_id;
				assert.isDefined(fileId);

				const second = yield* callSendVideo(botToken, {
					chat_id: chatId,
					video: fileId,
					caption: "sendVideo file_id resend",
				});

				assert.strictEqual(second.caption, "sendVideo file_id resend");
				assert.strictEqual(second.video?.file_id, fileId);
			}),
		);
	});

	describe("Telegram API errors", () => {
		test.effect("NoVideoInRequest when video is missing", () =>
			Effect.gen(function* () {
				const { botToken, chatId } = yield* telegramConfig;
				const error = yield* callSendVideo(botToken, { chat_id: chatId }).pipe(Effect.flip);

				expectErrorTag(error, "NoVideoInRequest", "Bad Request: there is no video in the request");
			}),
		);

		test.effect("ChatIdEmpty when chat_id is missing", () =>
			Effect.gen(function* () {
				const { botToken } = yield* telegramConfig;
				const error = yield* callSendVideo(botToken, { video: readVideoFixture() }).pipe(Effect.flip);

				expectErrorTag(error, "ChatIdEmpty", "Bad Request: chat_id is empty");
			}),
		);

		test.effect("ChatIdEmpty when chat_id is an empty string", () =>
			Effect.gen(function* () {
				const { botToken } = yield* telegramConfig;
				const error = yield* callSendVideo(botToken, { chat_id: "", video: readVideoFixture() }).pipe(Effect.flip);

				expectErrorTag(error, "ChatIdEmpty", "Bad Request: chat_id is empty");
			}),
		);

		test.effect("ChatNotFound when chat_id does not exist", () =>
			Effect.gen(function* () {
				const { botToken } = yield* telegramConfig;
				const error = yield* callSendVideo(botToken, {
					chat_id: 0,
					video: readVideoFixture(),
				}).pipe(Effect.flip);

				expectErrorTag(error, "ChatNotFound", "Bad Request: chat not found");
			}),
		);

		test.effect("MessageCaptionTooLong when caption exceeds 1024 characters", () =>
			Effect.gen(function* () {
				const { botToken, chatId } = yield* telegramConfig;
				const error = yield* callSendVideo(botToken, {
					chat_id: chatId,
					video: readVideoFixture(),
					caption: "x".repeat(1025),
				}).pipe(Effect.flip);

				expectErrorTag(error, "MessageCaptionTooLong", "Bad Request: message caption is too long");
			}),
		);

		test.effect("UnsupportedParseMode when parse_mode is invalid", () =>
			Effect.gen(function* () {
				const { botToken, chatId } = yield* telegramConfig;
				const error = yield* callSendVideo(botToken, {
					chat_id: chatId,
					video: readVideoFixture(),
					caption: "test",
					parse_mode: "INVALID",
				}).pipe(Effect.flip);

				expectErrorTag(error, "UnsupportedParseMode", "Bad Request: unsupported parse_mode");
			}),
		);

		test.effect("CantParseEntitiesNoBoldEnd when caption MarkdownV2 bold entity is unclosed", () =>
			Effect.gen(function* () {
				const { botToken, chatId } = yield* telegramConfig;
				const error = yield* callSendVideo(botToken, {
					chat_id: chatId,
					video: readVideoFixture(),
					caption: "*unclosed",
					parse_mode: "MarkdownV2",
				}).pipe(Effect.flip);

				expectErrorTag(
					error,
					"CantParseEntitiesNoBoldEnd",
					"Bad Request: can't parse entities: Can't find end of Bold entity at byte offset 0",
				);
			}),
		);

		test.effect("MessageThreadNotFound when message_thread_id does not exist", () =>
			Effect.gen(function* () {
				const { botToken, chatId } = yield* telegramConfig;
				const error = yield* callSendVideo(botToken, {
					chat_id: chatId,
					video: readVideoFixture(),
					message_thread_id: 999999999,
				}).pipe(Effect.flip);

				expectErrorTag(error, "MessageThreadNotFound", "Bad Request: message thread not found");
			}),
		);

		test.effect("MessageToReplyNotFound when reply_parameters.message_id does not exist", () =>
			Effect.gen(function* () {
				const { botToken, chatId } = yield* telegramConfig;
				const error = yield* callSendVideo(botToken, {
					chat_id: chatId,
					video: readVideoFixture(),
					reply_parameters: { message_id: 999999999 },
				}).pipe(Effect.flip);

				expectErrorTag(error, "MessageToReplyNotFound", "Bad Request: message to be replied not found");
			}),
		);

		test.effect("WrongRemoteFileIdentifierWrongPadding when video file_id is malformed", () =>
			Effect.gen(function* () {
				const { botToken, chatId } = yield* telegramConfig;
				const error = yield* callSendVideo(botToken, {
					chat_id: chatId,
					video: "invalid-file-id",
				}).pipe(Effect.flip);

				expectErrorTag(
					error,
					"WrongRemoteFileIdentifierWrongPadding",
					"Bad Request: wrong remote file identifier specified: Wrong padding in the string",
				);
			}),
		);
	});

	authErrorTests(test, token => callSendVideo(token, { chat_id: 1, video: "invalid" }));
});
