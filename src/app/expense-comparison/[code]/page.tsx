"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useExpenseComparison } from "@/hooks/useExpenseComparison";
import type { MonthName } from "@/types/expense-comparison";
import type { EditTarget } from "@/components/expense-comparison/AddEntryModal";
import { YearSelector } from "@/components/expense-comparison/YearSelector";
import { ExpenseTable } from "@/components/expense-comparison/ExpenseTable";
import { AddEntryModal } from "@/components/expense-comparison/AddEntryModal";
import { DownloadButton } from "@/components/expense-comparison/DownloadButton";
import { UploadButton } from "@/components/expense-comparison/UploadButton";
import { ShareButton } from "@/components/expense-comparison/ShareButton";

export default function ExpenseComparisonSheetPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = use(params);
  const { state, loaded, setYears, addEntry, bulkAddEntries, deleteRow, setRegion } = useExpenseComparison(code);
  const [editTarget, setEditTarget] = useState<EditTarget | null>(null);

  function handleEditCell(rowId: string, month: MonthName) {
    const row = state.rows.find((r) => r.id === rowId);
    if (!row) return;
    const md = row.months[month];
    setEditTarget({
      expenseName: row.expenseName,
      accountCode: row.accountCode,
      month,
      year1Amount: md?.year1Amount ?? null,
      year2Amount: md?.year2Amount ?? null,
    });
  }

  if (!loaded) {
    return (
      <div className="min-h-screen bg-snow flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-snow">
      <header className="border-b border-silver px-6 py-8">
        <div className="max-w-[90rem] mx-auto flex items-center justify-between">
          <div>
            <Link href="/expense-comparison" className="text-steel text-sm hover:underline">
              &larr; New Comparison
            </Link>
            <h1 className="text-3xl font-bold text-crimson mt-1">Expense Comparison</h1>
            <p className="text-gray-600 mt-1">
              {state.year1} vs {state.year2}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <ShareButton code={code} />
            <UploadButton bulkAddEntries={bulkAddEntries} setRegion={setRegion} />
            <DownloadButton state={state} />
          </div>
        </div>
      </header>

      <main className="max-w-[90rem] mx-auto px-6 py-8 space-y-6">
        <YearSelector
          onSetYears={setYears}
          defaultYear1={state.year1}
          defaultYear2={state.year2}
        />

        <AddEntryModal
          year1={state.year1}
          year2={state.year2}
          onAdd={addEntry}
          editTarget={editTarget}
          onClose={() => setEditTarget(null)}
        />

        <ExpenseTable
          state={state}
          onDeleteRow={deleteRow}
          onRegionChange={setRegion}
          onEditCell={handleEditCell}
        />
      </main>
    </div>
  );
}
