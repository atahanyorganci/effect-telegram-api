import { FIELD_TABLE_HEADERS } from "./parse-table.ts";
import type { HTMLElement } from "node-html-parser";

export const isFieldTable = (table: HTMLElement): boolean => {
	const headers = table.querySelectorAll("thead th").map(cell => cell.text.trim());

	return (
		headers.length === FIELD_TABLE_HEADERS.length &&
		headers.every((header, index) => header === FIELD_TABLE_HEADERS[index])
	);
};
