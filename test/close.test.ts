import { describe } from "@effect/vitest";
import * as Telegram from "../src/index.ts";
import { authErrorTests } from "./helpers.ts";

const callClose = (token: string, payload: unknown) =>
	Telegram.Client.callMethod(token, Telegram.Methods.close, payload);

describe("close", () => {
	authErrorTests(token => callClose(token, {}));
});
