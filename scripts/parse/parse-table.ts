import { parseError } from "./errors.ts";
import type { HTMLElement } from "node-html-parser";

export const FIELD_TABLE_HEADERS = ["Field", "Type", "Description"] as const;

export interface FieldTableRow {
	readonly fieldCell: HTMLElement;
	readonly typeCell: HTMLElement;
	readonly descriptionCell: HTMLElement;
}

export const assertFieldTable = (table: HTMLElement): void => {
	const headers = table.querySelectorAll("thead th").map(cell => cell.text.trim());

	if (
		headers.length !== FIELD_TABLE_HEADERS.length ||
		headers.some((header, index) => header !== FIELD_TABLE_HEADERS[index])
	) {
		throw parseError(`Expected field table headers ${FIELD_TABLE_HEADERS.join(", ")}, got ${headers.join(", ")}`);
	}
};

export const parseFieldTableRows = (table: HTMLElement): FieldTableRow[] =>
	table.querySelectorAll("tbody tr").map(row => {
		const cells = row.querySelectorAll("td");

		if (cells.length !== 3) {
			throw parseError(`Expected 3 table cells, got ${cells.length}`);
		}

		return {
			fieldCell: cells[0]!,
			typeCell: cells[1]!,
			descriptionCell: cells[2]!,
		};
	});
