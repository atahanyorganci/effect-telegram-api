import * as Effect from "effect/Effect";
import { cleanupTestArtifacts, resetCreatedForumTopicsRegistry } from "./helpers.ts";

export default async () => {
	resetCreatedForumTopicsRegistry();

	return async () => {
		await Effect.runPromise(cleanupTestArtifacts);
	};
};
