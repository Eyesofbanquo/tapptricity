"use client";

import { MONTH_NAMES } from "@/types/expense-comparison";
import type { ExpenseComparisonState } from "@/types/expense-comparison";
import * as XLSX from "xlsx";

interface DownloadButtonProps {
  state: ExpenseComparisonState;
}

/** Format month + year as "Jan-25" */
function monthYearLabel(month: string, year: number): string {
  return `${month.slice(0, 3)}-${String(year).slice(-2)}`;
}

export function downloadExpenseSheet(state: ExpenseComparisonState) {
  const regionRow: string[] = ["Region #", state.region ?? ""];
  for (let i = 0; i < MONTH_NAMES.length * 3; i++) regionRow.push("");

  const header: string[] = ["Expense", "Acct Code"];
  for (const month of MONTH_NAMES) {
    header.push(
      monthYearLabel(month, state.year1),
      monthYearLabel(month, state.year2),
      "Diff",
    );
  }

  const dataRows = state.rows.map((row) => {
    const cells: (string | number)[] = [row.expenseName, row.accountCode];
    for (const month of MONTH_NAMES) {
      const md = row.months[month];
      const y1 = md?.year1Amount ?? "";
      const y2 = md?.year2Amount ?? "";
      const diff = typeof y1 === "number" && typeof y2 === "number" ? y2 - y1 : 0;
      cells.push(y1, y2, diff);
    }
    return cells;
  });

  const ws = XLSX.utils.aoa_to_sheet([regionRow, header, ...dataRows]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Expense Comparison");
  XLSX.writeFile(wb, `Expense_Comparison_${state.year1}_vs_${state.year2}.xlsx`);
}

export function DownloadButton({ state }: DownloadButtonProps) {
  return (
    <button
      onClick={() => downloadExpenseSheet(state)}
      disabled={state.rows.length === 0}
      className="px-4 py-2 bg-steel text-white rounded hover:bg-steel/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      Download .xlsx
    </button>
  );
}
