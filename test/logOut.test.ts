import { describe } from "@effect/vitest";
import * as Telegram from "../src/index.ts";
import { authErrorTests } from "./helpers.ts";

const callLogOut = (token: string, payload: unknown) =>
	Telegram.Client.callMethod(token, Telegram.Methods.logOut, payload);

describe("logOut", () => {
	authErrorTests(token => callLogOut(token, {}));
});
