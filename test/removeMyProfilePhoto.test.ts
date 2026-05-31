import { authErrorTests, callClient, liveTests } from "./helpers.ts";

const callRemoveMyProfilePhoto = (token: string) => callClient("removeMyProfilePhoto", token);

liveTests("removeMyProfilePhoto", test => {
	authErrorTests(test, callRemoveMyProfilePhoto);
});
