/**
 * Extended live probe for methods with thin error coverage.
 * Run: pnpm tsx scripts/probe-errors-extended.ts
 */
import "dotenv/config";
import { NodeHttpClient, NodeServices } from "@effect/platform-node";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Result from "effect/Result";
import * as Telegram from "../src/index.ts";

const LiveLayer = Layer.mergeAll(NodeServices.layer, NodeHttpClient.layerFetch);

const token = process.env.TELEGRAM_BOT_TOKEN!;
const chatId = Number(process.env.TELEGRAM_CHAT_ID);
const groupId = Number(process.env.TELEGRAM_GROUP_CHAT_ID);
const forumTopicId = Number(process.env.TELEGRAM_FORUM_TOPIC_ID);

const flip = <A, E, R>(effect: Effect.Effect<A, E, R>) => effect.pipe(Effect.flip);

const formatFailure = (error: unknown): { tag: string; code?: number; description: string } => {
	if (error && typeof error === "object" && "_tag" in error && "description" in error) {
		const e = error as { _tag: string; description: string; errorCode?: number };
		return { tag: e._tag, code: e.errorCode, description: e.description };
	}
	return { tag: "unknown", description: String(error) };
};

type Case = {
	readonly method: string;
	readonly label: string;
	readonly run: Effect.Effect<unknown, unknown, Layer.Layer.Success<typeof LiveLayer>>;
};

const cases: readonly Case[] = [
	{
		method: "unpinAllChatMessages",
		label: "private chat",
		run: flip(Telegram.Client.callMethod(token, Telegram.Methods.unpinAllChatMessages, { chat_id: chatId })),
	},
	{
		method: "unpinAllForumTopicMessages",
		label: "group topic",
		run: flip(
			Telegram.Client.callMethod(token, Telegram.Methods.unpinAllForumTopicMessages, {
				chat_id: groupId,
				message_thread_id: forumTopicId,
			}),
		),
	},
	{
		method: "unpinAllGeneralForumTopicMessages",
		label: "group general",
		run: flip(
			Telegram.Client.callMethod(token, Telegram.Methods.unpinAllGeneralForumTopicMessages, { chat_id: groupId }),
		),
	},
	{
		method: "unhideGeneralForumTopic",
		label: "group",
		run: flip(Telegram.Client.callMethod(token, Telegram.Methods.unhideGeneralForumTopic, { chat_id: groupId })),
	},
	{
		method: "reopenGeneralForumTopic",
		label: "group",
		run: flip(Telegram.Client.callMethod(token, Telegram.Methods.reopenGeneralForumTopic, { chat_id: groupId })),
	},
	{
		method: "leaveChat",
		label: "private chat",
		run: flip(Telegram.Client.callMethod(token, Telegram.Methods.leaveChat, { chat_id: chatId })),
	},
	{
		method: "leaveChat",
		label: "invalid chat",
		run: flip(Telegram.Client.callMethod(token, Telegram.Methods.leaveChat, { chat_id: 0 })),
	},
	{
		method: "setChatPhoto",
		label: "private no photo",
		run: flip(Telegram.Client.callMethod(token, Telegram.Methods.setChatPhoto, { chat_id: chatId })),
	},
	{
		method: "setChatPhoto",
		label: "group no photo",
		run: flip(Telegram.Client.callMethod(token, Telegram.Methods.setChatPhoto, { chat_id: groupId })),
	},
	{
		method: "deleteChatStickerSet",
		label: "group",
		run: flip(Telegram.Client.callMethod(token, Telegram.Methods.deleteChatStickerSet, { chat_id: groupId })),
	},
	{
		method: "deleteChatStickerSet",
		label: "private",
		run: flip(Telegram.Client.callMethod(token, Telegram.Methods.deleteChatStickerSet, { chat_id: chatId })),
	},
	{
		method: "exportChatInviteLink",
		label: "group",
		run: flip(Telegram.Client.callMethod(token, Telegram.Methods.exportChatInviteLink, { chat_id: groupId })),
	},
	{
		method: "editChatInviteLink",
		label: "bogus link",
		run: flip(
			Telegram.Client.callMethod(token, Telegram.Methods.editChatInviteLink, {
				chat_id: groupId,
				invite_link: "https://t.me/+bogus",
				name: "x",
			}),
		),
	},
	{
		method: "createChatSubscriptionInviteLink",
		label: "private",
		run: flip(
			Telegram.Client.callMethod(token, Telegram.Methods.createChatSubscriptionInviteLink, {
				chat_id: chatId,
				subscription_period: 30,
				subscription_price: 1,
			}),
		),
	},
	{
		method: "createChatSubscriptionInviteLink",
		label: "group",
		run: flip(
			Telegram.Client.callMethod(token, Telegram.Methods.createChatSubscriptionInviteLink, {
				chat_id: groupId,
				subscription_period: 30,
				subscription_price: 1,
			}),
		),
	},
	{
		method: "setChatAdministratorCustomTitle",
		label: "invalid user",
		run: flip(
			Telegram.Client.callMethod(token, Telegram.Methods.setChatAdministratorCustomTitle, {
				chat_id: groupId,
				user_id: 1,
				custom_title: "x",
			}),
		),
	},
	{
		method: "banChatSenderChat",
		label: "missing sender",
		run: flip(Telegram.Client.callMethod(token, Telegram.Methods.banChatSenderChat, { chat_id: groupId })),
	},
	{
		method: "banChatSenderChat",
		label: "invalid sender",
		run: flip(
			Telegram.Client.callMethod(token, Telegram.Methods.banChatSenderChat, { chat_id: groupId, sender_chat_id: 1 }),
		),
	},
	{
		method: "unbanChatSenderChat",
		label: "invalid sender",
		run: flip(
			Telegram.Client.callMethod(token, Telegram.Methods.unbanChatSenderChat, { chat_id: groupId, sender_chat_id: 1 }),
		),
	},
	{
		method: "getChatGifts",
		label: "private",
		run: flip(Telegram.Client.callMethod(token, Telegram.Methods.getChatGifts, { chat_id: chatId })),
	},
	{
		method: "getChatGifts",
		label: "group",
		run: flip(Telegram.Client.callMethod(token, Telegram.Methods.getChatGifts, { chat_id: groupId })),
	},
	{
		method: "getUserGifts",
		label: "invalid user",
		run: flip(Telegram.Client.callMethod(token, Telegram.Methods.getUserGifts, { user_id: 1 })),
	},
	{
		method: "giftPremiumSubscription",
		label: "invalid user",
		run: flip(
			Telegram.Client.callMethod(token, Telegram.Methods.giftPremiumSubscription, {
				user_id: 1,
				month_count: 1,
				star_count: 1,
			}),
		),
	},
	{
		method: "sendGift",
		label: "no gift id",
		run: flip(Telegram.Client.callMethod(token, Telegram.Methods.sendGift, { user_id: chatId })),
	},
	{
		method: "transferGift",
		label: "no params",
		run: flip(Telegram.Client.callMethod(token, Telegram.Methods.transferGift, {})),
	},
	{
		method: "convertGiftToStars",
		label: "no params",
		run: flip(Telegram.Client.callMethod(token, Telegram.Methods.convertGiftToStars, {})),
	},
	{
		method: "upgradeGift",
		label: "no params",
		run: flip(Telegram.Client.callMethod(token, Telegram.Methods.upgradeGift, {})),
	},
	{ method: "postStory", label: "empty", run: flip(Telegram.Client.callMethod(token, Telegram.Methods.postStory, {})) },
	{
		method: "editStory",
		label: "invalid id",
		run: flip(Telegram.Client.callMethod(token, Telegram.Methods.editStory, { story_id: 1 })),
	},
	{
		method: "deleteStory",
		label: "invalid id",
		run: flip(Telegram.Client.callMethod(token, Telegram.Methods.deleteStory, { story_id: 1 })),
	},
	{
		method: "repostStory",
		label: "missing from",
		run: flip(Telegram.Client.callMethod(token, Telegram.Methods.repostStory, { story_id: 1 })),
	},
	{
		method: "repostStory",
		label: "invalid ids",
		run: flip(
			Telegram.Client.callMethod(token, Telegram.Methods.repostStory, { from_chat_id: groupId, story_id: 999_999 }),
		),
	},
	{
		method: "answerCallbackQuery",
		label: "invalid id",
		run: flip(
			Telegram.Client.callMethod(token, Telegram.Methods.answerCallbackQuery, { callback_query_id: "invalid" }),
		),
	},
	{
		method: "answerGuestQuery",
		label: "invalid",
		run: flip(
			Telegram.Client.callMethod(token, Telegram.Methods.answerGuestQuery, { guest_query_id: "x", answer: "x" }),
		),
	},
	{
		method: "answerWebAppQuery",
		label: "invalid",
		run: flip(
			Telegram.Client.callMethod(token, Telegram.Methods.answerWebAppQuery, { web_app_query_id: "x", result: {} }),
		),
	},
	{
		method: "verifyChat",
		label: "private",
		run: flip(
			Telegram.Client.callMethod(token, Telegram.Methods.verifyChat, { chat_id: chatId, custom_description: "x" }),
		),
	},
	{
		method: "verifyUser",
		label: "invalid user",
		run: flip(Telegram.Client.callMethod(token, Telegram.Methods.verifyUser, { user_id: 1, custom_description: "x" })),
	},
	{
		method: "removeChatVerification",
		label: "private",
		run: flip(Telegram.Client.callMethod(token, Telegram.Methods.removeChatVerification, { chat_id: chatId })),
	},
	{
		method: "removeUserVerification",
		label: "invalid user",
		run: flip(Telegram.Client.callMethod(token, Telegram.Methods.removeUserVerification, { user_id: 1 })),
	},
	{
		method: "getChatMenuButton",
		label: "group",
		run: flip(Telegram.Client.callMethod(token, Telegram.Methods.getChatMenuButton, { chat_id: groupId })),
	},
	{
		method: "setChatMenuButton",
		label: "invalid type",
		run: flip(
			Telegram.Client.callMethod(token, Telegram.Methods.setChatMenuButton, { menu_button: { type: "invalid" } }),
		),
	},
	{
		method: "getUserPersonalChatMessages",
		label: "self",
		run: flip(Telegram.Client.callMethod(token, Telegram.Methods.getUserPersonalChatMessages, { user_id: chatId })),
	},
	{
		method: "setUserEmojiStatus",
		label: "invalid user",
		run: flip(
			Telegram.Client.callMethod(token, Telegram.Methods.setUserEmojiStatus, {
				user_id: 1,
				emoji_status_custom_emoji_id: "1",
			}),
		),
	},
	{
		method: "readBusinessMessage",
		label: "no connection",
		run: flip(
			Telegram.Client.callMethod(token, Telegram.Methods.readBusinessMessage, {
				business_connection_id: "x",
				chat_id: chatId,
				message_id: 1,
			}),
		),
	},
	{
		method: "deleteBusinessMessages",
		label: "no connection",
		run: flip(
			Telegram.Client.callMethod(token, Telegram.Methods.deleteBusinessMessages, {
				business_connection_id: "x",
				message_ids: [1],
			}),
		),
	},
	{
		method: "getBusinessConnection",
		label: "invalid",
		run: flip(
			Telegram.Client.callMethod(token, Telegram.Methods.getBusinessConnection, { business_connection_id: "x" }),
		),
	},
	{
		method: "sendVenue",
		label: "no venue",
		run: flip(Telegram.Client.callMethod(token, Telegram.Methods.sendVenue, { chat_id: chatId })),
	},
	{
		method: "sendLocation",
		label: "no coords",
		run: flip(Telegram.Client.callMethod(token, Telegram.Methods.sendLocation, { chat_id: chatId })),
	},
	{
		method: "sendContact",
		label: "no phone",
		run: flip(Telegram.Client.callMethod(token, Telegram.Methods.sendContact, { chat_id: chatId, first_name: "A" })),
	},
	{
		method: "sendPoll",
		label: "empty question",
		run: flip(
			Telegram.Client.callMethod(token, Telegram.Methods.sendPoll, { chat_id: chatId, question: "", options: ["a"] }),
		),
	},
	{
		method: "sendPoll",
		label: "one option",
		run: flip(
			Telegram.Client.callMethod(token, Telegram.Methods.sendPoll, {
				chat_id: chatId,
				question: "Q?",
				options: ["only"],
			}),
		),
	},
	{
		method: "sendChecklist",
		label: "empty",
		run: flip(Telegram.Client.callMethod(token, Telegram.Methods.sendChecklist, { chat_id: chatId })),
	},
	{
		method: "sendMessageDraft",
		label: "no draft",
		run: flip(Telegram.Client.callMethod(token, Telegram.Methods.sendMessageDraft, { chat_id: chatId })),
	},
	{
		method: "sendPaidMedia",
		label: "no media",
		run: flip(Telegram.Client.callMethod(token, Telegram.Methods.sendPaidMedia, { chat_id: chatId, star_count: 1 })),
	},
	{
		method: "copyMessage",
		label: "same chat missing msg",
		run: flip(
			Telegram.Client.callMethod(token, Telegram.Methods.copyMessage, {
				chat_id: chatId,
				from_chat_id: chatId,
				message_id: 999_999_999,
			}),
		),
	},
	{
		method: "copyMessages",
		label: "no messages",
		run: flip(
			Telegram.Client.callMethod(token, Telegram.Methods.copyMessages, {
				chat_id: chatId,
				from_chat_id: chatId,
				message_ids: [],
			}),
		),
	},
	{
		method: "forwardMessages",
		label: "no messages",
		run: flip(
			Telegram.Client.callMethod(token, Telegram.Methods.forwardMessages, {
				chat_id: chatId,
				from_chat_id: chatId,
				message_ids: [],
			}),
		),
	},
	{
		method: "forwardMessages",
		label: "invalid thread",
		run: flip(
			Telegram.Client.callMethod(token, Telegram.Methods.forwardMessages, {
				chat_id: groupId,
				from_chat_id: chatId,
				message_ids: [1],
				message_thread_id: 999_999_999,
			}),
		),
	},
	{
		method: "savePreparedInlineMessage",
		label: "empty",
		run: flip(Telegram.Client.callMethod(token, Telegram.Methods.savePreparedInlineMessage, { user_id: chatId })),
	},
	{
		method: "savePreparedKeyboardButton",
		label: "empty",
		run: flip(Telegram.Client.callMethod(token, Telegram.Methods.savePreparedKeyboardButton, { user_id: chatId })),
	},
	{
		method: "getManagedBotToken",
		label: "invalid user",
		run: flip(Telegram.Client.callMethod(token, Telegram.Methods.getManagedBotToken, { user_id: 1 })),
	},
	{
		method: "replaceManagedBotToken",
		label: "invalid",
		run: flip(
			Telegram.Client.callMethod(token, Telegram.Methods.replaceManagedBotToken, {
				user_id: 1,
				new_token: "0:invalid",
			}),
		),
	},
	{
		method: "setManagedBotAccessSettings",
		label: "invalid user",
		run: flip(
			Telegram.Client.callMethod(token, Telegram.Methods.setManagedBotAccessSettings, { user_id: 1, settings: {} }),
		),
	},
	{
		method: "getManagedBotAccessSettings",
		label: "invalid user",
		run: flip(Telegram.Client.callMethod(token, Telegram.Methods.getManagedBotAccessSettings, { user_id: 1 })),
	},
	{
		method: "createForumTopic",
		label: "name too long",
		run: flip(
			Telegram.Client.callMethod(token, Telegram.Methods.createForumTopic, { chat_id: groupId, name: "x".repeat(200) }),
		),
	},
	{
		method: "pinChatMessage",
		label: "disable notification no msg",
		run: flip(
			Telegram.Client.callMethod(token, Telegram.Methods.pinChatMessage, {
				chat_id: groupId,
				disable_notification: true,
			}),
		),
	},
	{
		method: "setChatMemberTag",
		label: "empty tag",
		run: flip(
			Telegram.Client.callMethod(token, Telegram.Methods.setChatMemberTag, {
				chat_id: groupId,
				user_id: chatId,
				tag: "",
			}),
		),
	},
	{
		method: "editChatSubscriptionInviteLink",
		label: "bogus",
		run: flip(
			Telegram.Client.callMethod(token, Telegram.Methods.editChatSubscriptionInviteLink, {
				chat_id: groupId,
				invite_link: "https://t.me/+bogus",
			}),
		),
	},
	{
		method: "getBusinessAccountStarBalance",
		label: "invalid connection",
		run: flip(
			Telegram.Client.callMethod(token, Telegram.Methods.getBusinessAccountStarBalance, {
				business_connection_id: "x",
			}),
		),
	},
	{
		method: "setBusinessAccountName",
		label: "empty connection",
		run: flip(
			Telegram.Client.callMethod(token, Telegram.Methods.setBusinessAccountName, {
				business_connection_id: "x",
				first_name: "A",
			}),
		),
	},
	{
		method: "setBusinessAccountBio",
		label: "invalid connection",
		run: flip(
			Telegram.Client.callMethod(token, Telegram.Methods.setBusinessAccountBio, {
				business_connection_id: "x",
				bio: "x",
			}),
		),
	},
	{
		method: "setBusinessAccountUsername",
		label: "invalid connection",
		run: flip(
			Telegram.Client.callMethod(token, Telegram.Methods.setBusinessAccountUsername, {
				business_connection_id: "x",
				username: "x",
			}),
		),
	},
	{
		method: "setBusinessAccountProfilePhoto",
		label: "invalid connection",
		run: flip(
			Telegram.Client.callMethod(token, Telegram.Methods.setBusinessAccountProfilePhoto, {
				business_connection_id: "x",
			}),
		),
	},
	{
		method: "removeBusinessAccountProfilePhoto",
		label: "invalid connection",
		run: flip(
			Telegram.Client.callMethod(token, Telegram.Methods.removeBusinessAccountProfilePhoto, {
				business_connection_id: "x",
			}),
		),
	},
	{
		method: "setBusinessAccountGiftSettings",
		label: "invalid connection",
		run: flip(
			Telegram.Client.callMethod(token, Telegram.Methods.setBusinessAccountGiftSettings, {
				business_connection_id: "x",
				show_gift_button: true,
			}),
		),
	},
	{
		method: "getBusinessAccountGifts",
		label: "invalid connection",
		run: flip(
			Telegram.Client.callMethod(token, Telegram.Methods.getBusinessAccountGifts, { business_connection_id: "x" }),
		),
	},
	{
		method: "transferBusinessAccountStars",
		label: "invalid connection",
		run: flip(
			Telegram.Client.callMethod(token, Telegram.Methods.transferBusinessAccountStars, {
				business_connection_id: "x",
				star_count: 1,
			}),
		),
	},
];

const program = Effect.gen(function* () {
	const discoveries = new Map<string, Array<{ label: string; tag: string; description: string }>>();

	for (const probe of cases) {
		const result = yield* probe.run.pipe(Effect.result);
		if (Result.isSuccess(result)) {
			console.log(`[OK] ${probe.method} — ${probe.label}`);
			continue;
		}
		const f = formatFailure(result.failure);
		console.log(`[ERR] ${probe.method} — ${probe.label}`);
		console.log(`      ${f.tag}: ${f.description}`);
		const list = discoveries.get(probe.method) ?? [];
		if (!list.some(e => e.description === f.description)) {
			list.push({ label: probe.label, tag: f.tag, description: f.description });
		}
		discoveries.set(probe.method, list);
	}

	console.log("\n=== Unique errors per method ===");
	for (const [method, errs] of [...discoveries.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
		console.log(`\n${method}:`);
		for (const e of errs) {
			console.log(`  ${e.tag} | ${e.description}`);
		}
	}
});

await Effect.runPromise(program.pipe(Effect.provide(LiveLayer)));
