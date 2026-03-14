export const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
] as const;

export type MonthName = (typeof MONTH_NAMES)[number];

export interface MonthData {
  year1Amount: number | null;
  year2Amount: number | null;
}

export interface ExpenseRow {
  id: string;
  expenseName: string;
  accountCode: string;
  months: Partial<Record<MonthName, MonthData>>;
}

export interface ExpenseComparisonState {
  year1: number;
  year2: number;
  region?: string;
  rows: ExpenseRow[];
  name?: string;
  createdAt?: string;
  modifiedAt?: string;
}
