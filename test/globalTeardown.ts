import * as Effect from "effect/Effect";
import { cleanupTestArtifacts } from "./helpers.ts";

export default async () => {
	await Effect.runPromise(cleanupTestArtifacts);
};
