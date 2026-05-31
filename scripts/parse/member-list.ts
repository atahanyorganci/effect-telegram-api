import type { HTMLElement } from "node-html-parser";

const TYPE_NAME = /^[A-Z][A-Za-z0-9_]*$/;

/** True when every `<li>` is a single in-document type link (`<a href="#slug">TypeName</a>`). */
export const isMemberListUl = (ul: HTMLElement): boolean => {
	const items = ul.querySelectorAll("li");

	if (items.length < 2) {
		return false;
	}

	for (const li of items) {
		const anchors = li.querySelectorAll('a[href^="#"]');

		if (anchors.length !== 1) {
			return false;
		}

		const anchor = anchors[0]!;
		const name = anchor.text.trim();

		if (name !== li.text.trim() || !TYPE_NAME.test(name)) {
			return false;
		}
	}

	return true;
};

export const parseMemberListUl = (ul: HTMLElement): readonly string[] =>
	ul.querySelectorAll("li").map(li => li.querySelector('a[href^="#"]')!.text.trim());
