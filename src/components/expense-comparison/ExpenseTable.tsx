"use client";

import { Fragment, useState } from "react";
import { MONTH_NAMES } from "@/types/expense-comparison";
import type { ExpenseComparisonState, MonthName } from "@/types/expense-comparison";

interface ExpenseTableProps {
  state: ExpenseComparisonState;
  onDeleteRow: (id: string) => void;
  onRegionChange: (region: string) => void;
  onEditCell?: (rowId: string, month: MonthName) => void;
}

function formatAmount(val: number | null | undefined): string {
  if (val == null) return "—";
  return val.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 });
}

function formatDiff(diff: number | null): string {
  if (diff == null) return "$0.00";
  return diff.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 });
}

function diffColor(diff: number | null): string {
  if (diff == null || diff === 0) return "text-gray-600";
  return diff > 0 ? "text-green-600" : "text-crimson";
}

/** Format month + year as "Jan-25" */
function monthYearLabel(month: string, year: number): string {
  return `${month.slice(0, 3)}-${String(year).slice(-2)}`;
}

export function ExpenseTable({ state, onDeleteRow, onRegionChange, onEditCell }: ExpenseTableProps) {
  const [expenseCollapsed, setExpenseCollapsed] = useState(false);
  const [acctCodeCollapsed, setAcctCodeCollapsed] = useState(false);

  const expenseWidth = expenseCollapsed ? "min-w-[72px] max-w-[72px]" : "min-w-[160px]";
  const acctCodeWidth = acctCodeCollapsed ? "min-w-[64px] max-w-[64px]" : "min-w-[160px]";
  const acctCodeLeft = expenseCollapsed ? "left-[72px]" : "left-[160px]";

  if (state.rows.length === 0) {
    return (
      <p className="text-gray-500 italic">
        No entries yet. Click &quot;Add Entry&quot; to get started.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto border border-silver rounded-lg">
      <table className="min-w-full text-sm border-collapse">
        <thead>
          {/* Region row */}
          <tr className="bg-gray-50">
            <th
              colSpan={2}
              className={`sticky left-0 bg-gray-50 z-10 px-3 py-2 text-left border-b border-r border-silver ${expenseCollapsed && acctCodeCollapsed ? "max-w-[136px]" : ""}`}
            >
              <label className="flex items-center gap-2">
                <span className="font-semibold text-gray-700">Region #</span>
                <input
                  type="text"
                  value={state.region ?? ""}
                  onChange={(e) => onRegionChange(e.target.value)}
                  placeholder="Enter region..."
                  className="border border-silver rounded px-2 py-1 text-sm w-32"
                />
              </label>
            </th>
            <th
              colSpan={MONTH_NAMES.length * 3 + 1}
              className="border-b border-silver"
            />
          </tr>
          {/* Single header row: Expense | Acct Code | Jan-25 | Jan-26 | Diff | Feb-25 | ... */}
          <tr className="bg-gray-100">
            <th
              onClick={() => setExpenseCollapsed((c) => !c)}
              className={`sticky left-0 bg-gray-100 z-10 px-3 py-2 text-left border-b border-r border-silver cursor-pointer select-none ${expenseWidth}`}
            >
              <span className="flex items-center gap-1">
                {expenseCollapsed ? "»" : "«"} {expenseCollapsed ? "Exp" : "Expense"}
              </span>
            </th>
            <th
              onClick={() => setAcctCodeCollapsed((c) => !c)}
              className={`sticky ${acctCodeLeft} bg-gray-100 z-10 px-3 py-2 text-left border-b border-r border-silver cursor-pointer select-none ${acctCodeWidth}`}
            >
              <span className="flex items-center gap-1">
                {acctCodeCollapsed ? "»" : "«"} {acctCodeCollapsed ? "Acct" : "Acct Code"}
              </span>
            </th>
            {MONTH_NAMES.map((month) => (
              <Fragment key={month}>
                <th className="px-2 py-2 text-center border-b border-silver whitespace-nowrap">
                  {monthYearLabel(month, state.year1)}
                </th>
                <th className="px-2 py-2 text-center border-b border-silver whitespace-nowrap">
                  {monthYearLabel(month, state.year2)}
                </th>
                <th className="px-2 py-2 text-center border-b border-r border-silver whitespace-nowrap bg-gray-200 font-semibold">
                  Diff
                </th>
              </Fragment>
            ))}
            <th className="px-2 py-2 border-b border-silver" />
          </tr>
        </thead>
        <tbody>
          {state.rows.map((row) => (
            <tr key={row.id} className="hover:bg-sky-light/10">
              <td className={`sticky left-0 bg-snow z-10 px-3 py-2 border-b border-r border-silver font-medium whitespace-nowrap overflow-hidden text-ellipsis ${expenseWidth}`}>
                {expenseCollapsed ? `${row.expenseName.slice(0, 4)}…` : row.expenseName}
              </td>
              <td className={`sticky ${acctCodeLeft} bg-snow z-10 px-3 py-2 border-b border-r border-silver text-gray-600 whitespace-nowrap overflow-hidden text-ellipsis ${acctCodeWidth}`}>
                {row.accountCode}
              </td>
              {MONTH_NAMES.map((month) => {
                const md = row.months[month];
                const y1 = md?.year1Amount ?? null;
                const y2 = md?.year2Amount ?? null;
                const diff = y1 != null && y2 != null ? y2 - y1 : null;

                return (
                  <Fragment key={month}>
                    <td
                      onClick={() => onEditCell?.(row.id, month)}
                      className="px-2 py-2 text-right border-b border-silver whitespace-nowrap cursor-pointer hover:bg-sky-light/20"
                    >
                      {formatAmount(y1)}
                    </td>
                    <td
                      onClick={() => onEditCell?.(row.id, month)}
                      className="px-2 py-2 text-right border-b border-silver whitespace-nowrap cursor-pointer hover:bg-sky-light/20"
                    >
                      {formatAmount(y2)}
                    </td>
                    <td className={`px-2 py-2 text-right border-b border-r border-silver whitespace-nowrap font-medium bg-gray-200 ${diffColor(diff)}`}>
                      {formatDiff(diff)}
                    </td>
                  </Fragment>
                );
              })}
              <td className="px-2 py-2 border-b border-silver">
                <button
                  onClick={() => onDeleteRow(row.id)}
                  className="text-gray-400 hover:text-crimson text-xs"
                  title="Delete row"
                >
                  ✕
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
