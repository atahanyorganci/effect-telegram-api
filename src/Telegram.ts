import * as HttpApiClient from "effect/unstable/httpapi/HttpApiClient";
import { TelegramBotApi } from "./Methods.ts";

const BASE_URL = "https://api.telegram.org";

/**
 * Builds a typed {@link HttpApiClient} for the given bot token. Responses use
 * Telegram's raw wire format; callers must narrow on `ok`.
 */
export const withToken = (token: string) => {
	return HttpApiClient.make(TelegramBotApi, { baseUrl: `${BASE_URL}/bot${token}` });
};
