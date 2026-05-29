import { PARAMETER_TABLE_HEADERS } from "./parse-parameter-table.ts";
import type { HTMLElement } from "node-html-parser";

export const isParameterTable = (table: HTMLElement): boolean => {
	const headers = table.querySelectorAll("thead th").map(cell => cell.text.trim());

	return (
		headers.length === PARAMETER_TABLE_HEADERS.length &&
		headers.every((header, index) => header === PARAMETER_TABLE_HEADERS[index])
	);
};
