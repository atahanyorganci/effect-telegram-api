import { authErrorTests, callClient, liveTests } from "./helpers.ts";

const callClose = (token: string) => callClient("close", token);

liveTests("close", test => {
	authErrorTests(test, callClose);
});
