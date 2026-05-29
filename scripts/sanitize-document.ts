import { parse, type HTMLElement, NodeType } from "node-html-parser";

const VOID_TAGS = new Set(["br", "hr"]);

const REMOVED_TAGS = new Set(["i", "script", "style", "link", "meta"]);

const UNWRAPPED_TAGS = new Set(["div", "span"]);

const ALLOWED_ATTRIBUTES: Readonly<Record<string, readonly string[]>> = {
	a: ["href"],
	h1: ["id"],
	h2: ["id"],
	h3: ["id"],
	h4: ["id"],
	h5: ["id"],
	h6: ["id"],
	td: ["colspan", "rowspan"],
	th: ["colspan", "rowspan"],
};

export class DocumentSanitizeError extends Error {
	override readonly name = "DocumentSanitizeError";
}

const normalizeHref = (href: string): string => {
	const trimmed = href.trim();
	if (trimmed.startsWith("#")) {
		return trimmed.toLowerCase();
	}

	if (trimmed.startsWith("/")) {
		return trimmed;
	}

	try {
		return new URL(trimmed).href;
	} catch {
		return trimmed;
	}
};

const isIllustrationSubtree = (element: HTMLElement): boolean => {
	const images = element.querySelectorAll("img");
	if (images.length === 0) {
		return false;
	}

	return images.every(image => {
		const source = image.getAttribute("src") ?? "";
		const alt = image.getAttribute("alt") ?? "";
		return source.startsWith("/file/") || alt === "TITLE";
	});
};

const stripAttributes = (element: HTMLElement): void => {
	const tag = element.tagName.toLowerCase();
	const allowed = ALLOWED_ATTRIBUTES[tag] ?? [];

	for (const attribute of Object.keys(element.attributes)) {
		if (!allowed.includes(attribute)) {
			element.removeAttribute(attribute);
		}
	}

	if (tag === "a") {
		const href = element.getAttribute("href");
		if (href === undefined) {
			element.remove();
			return;
		}

		element.setAttribute("href", normalizeHref(href));
	}
};

const normalizeHeadings = (root: HTMLElement): void => {
	for (const heading of root.querySelectorAll("h1,h2,h3,h4,h5,h6")) {
		const anchor = heading.querySelector("a[name]");
		if (anchor === null) {
			continue;
		}

		const slug = anchor.getAttribute("name") ?? anchor.getAttribute("href")?.replace(/^#/, "");
		if (slug !== undefined) {
			heading.setAttribute("id", slug.toLowerCase());
		}

		anchor.remove();
	}
};

const sanitizeElement = (element: HTMLElement): void => {
	for (const child of [...element.childNodes]) {
		if (child.nodeType === NodeType.COMMENT_NODE) {
			child.remove();
			continue;
		}

		if (child.nodeType === NodeType.ELEMENT_NODE) {
			sanitizeElement(child as HTMLElement);
		}
	}

	const tag = element.tagName.toLowerCase();

	if (REMOVED_TAGS.has(tag)) {
		element.remove();
		return;
	}

	if (tag === "img") {
		element.replaceWith(element.getAttribute("alt") ?? "");
		return;
	}

	if (UNWRAPPED_TAGS.has(tag)) {
		if (isIllustrationSubtree(element)) {
			element.remove();
			return;
		}

		element.replaceWith(...element.childNodes);
		return;
	}

	stripAttributes(element);
};

const escapeText = (value: string): string =>
	value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");

const escapeAttribute = (value: string): string => escapeText(value).replaceAll('"', "&quot;");

const serializeAttributes = (element: HTMLElement): string => {
	const attributes = Object.entries(element.attributes).sort(([left], [right]) => left.localeCompare(right));

	if (attributes.length === 0) {
		return "";
	}

	return attributes.map(([name, value]) => ` ${name}="${escapeAttribute(value)}"`).join("");
};

const serializeNode = (node: HTMLElement["childNodes"][number]): string => {
	if (node.nodeType === NodeType.TEXT_NODE) {
		return escapeText(node.text);
	}

	if (node.nodeType !== NodeType.ELEMENT_NODE) {
		return "";
	}

	const element = node as HTMLElement;
	const tag = element.tagName.toLowerCase();
	const attributes = serializeAttributes(element);
	const children = element.childNodes.map(serializeNode).join("");

	if (VOID_TAGS.has(tag)) {
		return `<${tag}${attributes}>`;
	}

	return `<${tag}${attributes}>${children}</${tag}>`;
};

export const sanitizeDocumentHtml = (html: string): string => {
	const document = parse(html);
	const content = document.querySelector("#dev_page_content");

	if (content === null) {
		throw new DocumentSanitizeError('Expected "#dev_page_content" in Telegram Bot API document');
	}

	normalizeHeadings(content);

	for (const icon of content.querySelectorAll("i")) {
		icon.remove();
	}

	for (const child of [...content.childNodes]) {
		if (child.nodeType === NodeType.COMMENT_NODE) {
			child.remove();
			continue;
		}

		if (child.nodeType === NodeType.ELEMENT_NODE) {
			sanitizeElement(child as HTMLElement);
		}
	}

	return `<article>${content.childNodes.map(serializeNode).join("")}</article>`;
};
