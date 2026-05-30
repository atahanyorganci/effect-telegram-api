import { parseError } from "./errors.ts";
import type { HTMLElement } from "node-html-parser";

export const PARAMETER_TABLE_HEADERS = ["Parameter", "Type", "Required", "Description"] as const;

export interface ParameterTableRow {
	readonly nameCell: HTMLElement;
	readonly typeCell: HTMLElement;
	readonly requiredCell: HTMLElement;
	readonly descriptionCell: HTMLElement;
}

export const assertParameterTable = (table: HTMLElement): void => {
	const headers = table.querySelectorAll("thead th").map(cell => cell.text.trim());

	if (
		headers.length !== PARAMETER_TABLE_HEADERS.length ||
		headers.some((header, index) => header !== PARAMETER_TABLE_HEADERS[index])
	) {
		throw parseError(
			`Expected parameter table headers ${PARAMETER_TABLE_HEADERS.join(", ")}, got ${headers.join(", ")}`,
		);
	}
};

export const parseParameterRequired = (text: string): boolean => {
	switch (text.trim()) {
		case "Yes":
			return true;
		case "Optional":
			return false;
		default:
			throw parseError(`Expected parameter required value Yes or Optional, got "${text}"`);
	}
};

export const parseParameterTableRows = (table: HTMLElement): ParameterTableRow[] =>
	table.querySelectorAll("tbody tr").map(row => {
		const cells = row.querySelectorAll("td");

		if (cells.length !== 4) {
			throw parseError(`Expected 4 table cells, got ${cells.length}`);
		}

		return {
			nameCell: cells[0]!,
			typeCell: cells[1]!,
			requiredCell: cells[2]!,
			descriptionCell: cells[3]!,
		};
	});
