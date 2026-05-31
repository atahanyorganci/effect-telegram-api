import { authErrorTests, callClient, liveTests } from "./helpers.ts";

const callLogOut = (token: string) => callClient("logOut", token);

liveTests("logOut", test => {
	authErrorTests(test, callLogOut);
});
