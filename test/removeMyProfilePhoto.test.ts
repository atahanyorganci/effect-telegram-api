import { describe } from "@effect/vitest";
import * as Telegram from "../src/index.ts";
import { authErrorTests } from "./helpers.ts";

const callRemoveMyProfilePhoto = (token: string, payload: unknown) =>
	Telegram.Client.callMethod(token, Telegram.Methods.removeMyProfilePhoto, payload);

describe("removeMyProfilePhoto", () => {
	authErrorTests(token => callRemoveMyProfilePhoto(token, {}));
});
