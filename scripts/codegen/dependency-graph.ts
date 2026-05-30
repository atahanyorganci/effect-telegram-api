import { collectRefs } from "./render-type-expr.ts";
import type { ObjectType } from "../parse/model.ts";

export interface DependencyAnalysis {
	/** Object names in dependency-first order (a schema appears after every acyclic dependency). */
	readonly order: readonly string[];
	/** Maps each object name to the set of names in its strongly connected component. */
	readonly sccOf: ReadonlyMap<string, ReadonlySet<string>>;
	/** Names whose type must be declared explicitly because they take part in a reference cycle. */
	readonly recursive: ReadonlySet<string>;
}

/**
 * Analyzes references between object schemas using Tarjan's algorithm. The
 * returned order lists strongly connected components sinks-first (every acyclic
 * dependency precedes its dependents), so generated schemas can reference each
 * other directly unless they share a cycle.
 */
export const analyzeDependencies = (objects: readonly ObjectType[]): DependencyAnalysis => {
	const names = new Set(objects.map(object => object.name));
	const edges = new Map<string, readonly string[]>();
	const selfLoops = new Set<string>();

	for (const object of objects) {
		const refs = new Set<string>();
		for (const field of object.fields) {
			collectRefs(field.type, refs);
		}
		edges.set(object.name, [...refs].filter(ref => names.has(ref)).sort());
		if (refs.has(object.name)) {
			selfLoops.add(object.name);
		}
	}

	let counter = 0;
	const index = new Map<string, number>();
	const lowLink = new Map<string, number>();
	const onStack = new Set<string>();
	const stack: string[] = [];
	const components: string[][] = [];

	const strongConnect = (node: string): void => {
		index.set(node, counter);
		lowLink.set(node, counter);
		counter += 1;
		stack.push(node);
		onStack.add(node);

		for (const next of edges.get(node) ?? []) {
			if (!index.has(next)) {
				strongConnect(next);
				lowLink.set(node, Math.min(lowLink.get(node)!, lowLink.get(next)!));
			} else if (onStack.has(next)) {
				lowLink.set(node, Math.min(lowLink.get(node)!, index.get(next)!));
			}
		}

		if (lowLink.get(node) === index.get(node)) {
			const component: string[] = [];
			let member: string;
			do {
				member = stack.pop()!;
				onStack.delete(member);
				component.push(member);
			} while (member !== node);
			components.push(component.sort());
		}
	};

	for (const node of [...names].sort()) {
		if (!index.has(node)) {
			strongConnect(node);
		}
	}

	const sccOf = new Map<string, ReadonlySet<string>>();
	const recursive = new Set<string>();
	const order: string[] = [];

	for (const component of components) {
		const members = new Set(component);
		const isRecursive = component.length > 1 || selfLoops.has(component[0]!);
		for (const member of component) {
			sccOf.set(member, members);
			order.push(member);
			if (isRecursive) {
				recursive.add(member);
			}
		}
	}

	return { order, sccOf, recursive };
};
