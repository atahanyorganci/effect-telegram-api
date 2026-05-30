import { assert, describe, it } from "@effect/vitest";
import * as Effect from "effect/Effect";
import { readFileSync } from "node:fs";
import * as Telegram from "../src/index.ts";
import { authErrorTests, expectErrorTag, LiveLayer, requireBotToken, requireChatId } from "./helpers.ts";

const readVideoFixture = () => readFileSync(new URL("./video.mp4", import.meta.url));

const callSendVideo = (token: string, payload: unknown) =>
	Telegram.Client.callMethod(token, Telegram.Methods.sendVideo, payload);

describe("sendVideo", () => {
	describe("success", () => {
		it.effect("sends a local video fixture", () =>
			Effect.gen(function* () {
				const message = yield* callSendVideo(requireBotToken(), {
					chat_id: requireChatId(),
					video: readVideoFixture(),
					caption: "sendVideo integration test",
				});

				assert.strictEqual(typeof message.message_id, "number");
				assert.strictEqual(message.caption, "sendVideo integration test");
				assert.isDefined(message.video);
			}).pipe(Effect.provide(LiveLayer)),
		);

		it.effect("resends an uploaded video by file_id", () =>
			Effect.gen(function* () {
				const first = yield* callSendVideo(requireBotToken(), {
					chat_id: requireChatId(),
					video: readVideoFixture(),
				});
				const fileId = first.video?.file_id;
				assert.isDefined(fileId);

				const second = yield* callSendVideo(requireBotToken(), {
					chat_id: requireChatId(),
					video: fileId,
					caption: "sendVideo file_id resend",
				});

				assert.strictEqual(second.caption, "sendVideo file_id resend");
				assert.strictEqual(second.video?.file_id, fileId);
			}).pipe(Effect.provide(LiveLayer)),
		);
	});

	describe("Telegram API errors", () => {
		it.effect("NoVideoInRequest when video is missing", () =>
			Effect.gen(function* () {
				const error = yield* callSendVideo(requireBotToken(), { chat_id: requireChatId() }).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.NoVideoInRequest>(
					error,
					"NoVideoInRequest",
					"Bad Request: there is no video in the request",
				);
			}).pipe(Effect.provide(LiveLayer)),
		);

		it.effect("ChatIdEmpty when chat_id is missing", () =>
			Effect.gen(function* () {
				const error = yield* callSendVideo(requireBotToken(), { video: readVideoFixture() }).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.ChatIdEmpty>(error, "ChatIdEmpty", "Bad Request: chat_id is empty");
			}).pipe(Effect.provide(LiveLayer)),
		);

		it.effect("ChatIdEmpty when chat_id is an empty string", () =>
			Effect.gen(function* () {
				const error = yield* callSendVideo(requireBotToken(), {
					chat_id: "",
					video: readVideoFixture(),
				}).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.ChatIdEmpty>(error, "ChatIdEmpty", "Bad Request: chat_id is empty");
			}).pipe(Effect.provide(LiveLayer)),
		);

		it.effect("ChatNotFound when chat_id does not exist", () =>
			Effect.gen(function* () {
				const error = yield* callSendVideo(requireBotToken(), {
					chat_id: 0,
					video: readVideoFixture(),
				}).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.ChatNotFound>(error, "ChatNotFound", "Bad Request: chat not found");
			}).pipe(Effect.provide(LiveLayer)),
		);

		it.effect("MessageCaptionTooLong when caption exceeds 1024 characters", () =>
			Effect.gen(function* () {
				const error = yield* callSendVideo(requireBotToken(), {
					chat_id: requireChatId(),
					video: readVideoFixture(),
					caption: "x".repeat(1025),
				}).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.MessageCaptionTooLong>(
					error,
					"MessageCaptionTooLong",
					"Bad Request: message caption is too long",
				);
			}).pipe(Effect.provide(LiveLayer)),
		);

		it.effect("UnsupportedParseMode when parse_mode is invalid", () =>
			Effect.gen(function* () {
				const error = yield* callSendVideo(requireBotToken(), {
					chat_id: requireChatId(),
					video: readVideoFixture(),
					caption: "test",
					parse_mode: "INVALID",
				}).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.UnsupportedParseMode>(
					error,
					"UnsupportedParseMode",
					"Bad Request: unsupported parse_mode",
				);
			}).pipe(Effect.provide(LiveLayer)),
		);

		it.effect("CantParseEntitiesNoBoldEnd when caption MarkdownV2 bold entity is unclosed", () =>
			Effect.gen(function* () {
				const error = yield* callSendVideo(requireBotToken(), {
					chat_id: requireChatId(),
					video: readVideoFixture(),
					caption: "*unclosed",
					parse_mode: "MarkdownV2",
				}).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.CantParseEntitiesNoBoldEnd>(
					error,
					"CantParseEntitiesNoBoldEnd",
					"Bad Request: can't parse entities: Can't find end of Bold entity at byte offset 0",
				);
			}).pipe(Effect.provide(LiveLayer)),
		);

		it.effect("MessageThreadNotFound when message_thread_id does not exist", () =>
			Effect.gen(function* () {
				const error = yield* callSendVideo(requireBotToken(), {
					chat_id: requireChatId(),
					video: readVideoFixture(),
					message_thread_id: 999999999,
				}).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.MessageThreadNotFound>(
					error,
					"MessageThreadNotFound",
					"Bad Request: message thread not found",
				);
			}).pipe(Effect.provide(LiveLayer)),
		);

		it.effect("MessageToReplyNotFound when reply_parameters.message_id does not exist", () =>
			Effect.gen(function* () {
				const error = yield* callSendVideo(requireBotToken(), {
					chat_id: requireChatId(),
					video: readVideoFixture(),
					reply_parameters: { message_id: 999999999 },
				}).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.MessageToReplyNotFound>(
					error,
					"MessageToReplyNotFound",
					"Bad Request: message to be replied not found",
				);
			}).pipe(Effect.provide(LiveLayer)),
		);

		it.effect("WrongRemoteFileIdentifierWrongPadding when video file_id is malformed", () =>
			Effect.gen(function* () {
				const error = yield* callSendVideo(requireBotToken(), {
					chat_id: requireChatId(),
					video: "invalid-file-id",
				}).pipe(Effect.flip);

				expectErrorTag<Telegram.Errors.WrongRemoteFileIdentifierWrongPadding>(
					error,
					"WrongRemoteFileIdentifierWrongPadding",
					"Bad Request: wrong remote file identifier specified: Wrong padding in the string",
				);
			}).pipe(Effect.provide(LiveLayer)),
		);
	});

	authErrorTests(token => callSendVideo(token, { chat_id: 1 }));
});
