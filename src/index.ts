import * as NodeRuntime from "@effect/platform-node/NodeRuntime";
import * as Effect from "effect/Effect";

const program = Effect.gen(function* () {
	yield* Effect.log("Hello, world!");
});

NodeRuntime.runMain(program);
