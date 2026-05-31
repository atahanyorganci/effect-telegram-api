import { assert, describe, it } from "@effect/vitest";
import * as Effect from "effect/Effect";
import { parse } from "node-html-parser";
import { classifyBlock } from "../scripts/parse/classify-block.ts";
import { isMemberListUl } from "../scripts/parse/member-list.ts";
import { parseEmptyObjectBlock } from "../scripts/parse/parse-empty-object-block.ts";
import { parseObjectBlock } from "../scripts/parse/parse-object-block.ts";
import { parseUnionBlock } from "../scripts/parse/parse-union-block.ts";

const heading = (html: string) => parse(html).querySelector("h4")!;

describe("parse block classification", () => {
	it("classifies ChatMember as a union", () => {
		const block = heading(`<h4 id="chatmember">ChatMember</h4>
<p>This object contains information about one member of a chat. Currently, the following 6 types of chat members are supported:</p>
<ul>
<li><a href="#chatmemberowner">ChatMemberOwner</a></li>
<li><a href="#chatmemberadministrator">ChatMemberAdministrator</a></li>
<li><a href="#chatmembermember">ChatMemberMember</a></li>
</ul>`);

		assert.strictEqual(classifyBlock(block), "union");
	});

	it("classifies InputMedia as a union", () => {
		const block = heading(`<h4 id="inputmedia">InputMedia</h4>
<p>This object represents the content of a media message to be sent. It should be one of</p>
<ul>
<li><a href="#inputmediaphoto">InputMediaPhoto</a></li>
<li><a href="#inputmediavideo">InputMediaVideo</a></li>
</ul>`);

		assert.strictEqual(classifyBlock(block), "union");
	});

	it("classifies ForumTopicClosed as an empty object", () => {
		const block = heading(`<h4 id="forumtopicclosed">ForumTopicClosed</h4>
<p>This object represents a service message about a forum topic closed in the chat. Currently holds no information.</p>`);

		assert.strictEqual(classifyBlock(block), "empty");
	});

	it("does not classify Sending files as a union", () => {
		const block = heading(`<h4 id="sending-files">Sending files</h4>
<p>There are three ways to send files (photos, stickers, audio, media, etc.):</p>
<ul>
<li>It is not possible to change the file type when resending by <strong>file_id</strong>.</li>
</ul>`);

		assert.strictEqual(classifyBlock(block), undefined);
	});

	it("classifies Sticker as an object", () => {
		const block = heading(`<h4 id="sticker">Sticker</h4>
<p>This object represents a sticker.</p>
<table>
<thead><tr><th>Field</th><th>Type</th><th>Description</th></tr></thead>
<tbody><tr><td>file_id</td><td>String</td><td>Identifier for this file</td></tr></tbody>
</table>`);

		assert.strictEqual(classifyBlock(block), "object");
	});
});

describe("parse block parsers", () => {
	it("parses ChatMember union members", () => {
		const block = heading(`<h4 id="chatmember">ChatMember</h4>
<p>Chat member union.</p>
<ul>
<li><a href="#chatmemberowner">ChatMemberOwner</a></li>
<li><a href="#chatmembermember">ChatMemberMember</a></li>
</ul>`);

		const union = Effect.runSync(parseUnionBlock(block));

		assert.strictEqual(union.kind, "union");
		assert.strictEqual(union.name, "ChatMember");
		assert.deepStrictEqual(union.members, ["ChatMemberOwner", "ChatMemberMember"]);
	});

	it("parses ForumTopicClosed as an empty object", () => {
		const block = heading(`<h4 id="forumtopicclosed">ForumTopicClosed</h4>
<p>Currently holds no information.</p>`);

		const object = Effect.runSync(parseEmptyObjectBlock(block));

		assert.strictEqual(object.kind, "object");
		assert.strictEqual(object.name, "ForumTopicClosed");
		assert.deepStrictEqual(object.fields, []);
	});

	it("parses Sticker object fields", () => {
		const block = heading(`<h4 id="sticker">Sticker</h4>
<p>This object represents a sticker.</p>
<table>
<thead><tr><th>Field</th><th>Type</th><th>Description</th></tr></thead>
<tbody><tr><td>file_id</td><td>String</td><td>Identifier for this file</td></tr></tbody>
</table>`);

		const object = Effect.runSync(parseObjectBlock(block));

		assert.strictEqual(object.kind, "object");
		assert.strictEqual(object.name, "Sticker");
		assert.strictEqual(object.fields.length, 1);
		assert.strictEqual(object.fields[0]?.name, "file_id");
	});
});

describe("member list detection", () => {
	it("accepts type member lists", () => {
		const ul = parse(`<ul>
<li><a href="#inputmediaphoto">InputMediaPhoto</a></li>
<li><a href="#inputmediavideo">InputMediaVideo</a></li>
</ul>`).querySelector("ul")!;

		assert.strictEqual(isMemberListUl(ul), true);
	});

	it("rejects prose lists", () => {
		const ul = parse(`<ul>
<li>It is not possible to change the file type when resending by <a href="#video">video</a>.</li>
</ul>`).querySelector("ul")!;

		assert.strictEqual(isMemberListUl(ul), false);
	});
});
