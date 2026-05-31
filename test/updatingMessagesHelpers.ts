import { assert } from "@effect/vitest";
import { callClient, formDataPayload } from "./helpers.ts";

export const testPhotoUrl =
	"https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/Red_Apple.jpg/120px-Red_Apple.jpg";

export const sendPhoto = (token: string, payload: Record<string, unknown>) =>
	callClient("sendPhoto", token, formDataPayload(payload) as never);

export const expectEditedMessage = (value: unknown, messageId: number) => {
	assert.notStrictEqual(value, true);
	assert.strictEqual((value as { readonly message_id: number }).message_id, messageId);
};
