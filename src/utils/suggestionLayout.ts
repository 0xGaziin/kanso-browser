export const SUGGESTION_ROW_HEIGHT = 28;

// 8px vertical padding plus 2px total top/bottom borders.
const SUGGESTION_LIST_CHROME = 10;

export const SUGGESTION_LIST_GAP = 4;

// Sizes the overlay height strictly to the visible suggestion rows.
export function suggestionListHeight(rowCount: number): number {
  return rowCount * SUGGESTION_ROW_HEIGHT + SUGGESTION_LIST_CHROME;
}