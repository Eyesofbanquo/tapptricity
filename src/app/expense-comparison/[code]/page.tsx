"use client";

import { use, useState, useCallback, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useExpenseComparison } from "@/hooks/useExpenseComparison";
import type { MonthName } from "@/types/expense-comparison";
import type { EditTarget } from "@/components/expense-comparison/AddEntryModal";
import { YearSelector } from "@/components/expense-comparison/YearSelector";
import { ExpenseTable } from "@/components/expense-comparison/ExpenseTable";
import { AddEntryModal } from "@/components/expense-comparison/AddEntryModal";
import { DownloadButton, downloadExpenseSheet } from "@/components/expense-comparison/DownloadButton";
import { UploadButton, parseExpenseFile } from "@/components/expense-comparison/UploadButton";
import { ShareButton } from "@/components/expense-comparison/ShareButton";
import { SaveButton } from "@/components/expense-comparison/SaveButton";
import { ActionMenu } from "@/components/expense-comparison/ActionMenu";
import { Toast } from "@/components/expense-comparison/Toast";
import { DeleteSheetDialog } from "@/components/expense-comparison/DeleteSheetDialog";

export default function ExpenseComparisonSheetPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = use(params);
  const router = useRouter();
  const { state, loaded, saving, setYears, addEntry, bulkAddEntries, deleteRow, setRegion, flushSave, deleteSheet } =
    useExpenseComparison(code);
  const [editTarget, setEditTarget] = useState<EditTarget | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [pendingDeleteRowId, setPendingDeleteRowId] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const prevSaving = useRef(false);

  const mobileFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (prevSaving.current && !saving) {
      setShowToast(true);
      const t = setTimeout(() => setShowToast(false), 2000);
      return () => clearTimeout(t);
    }
    prevSaving.current = saving;
  }, [saving]);

  const handleShare = useCallback(() => {
    const url = `${window.location.origin}/expense-comparison/${code}`;
    navigator.clipboard.writeText(url);
  }, [code]);

  const handleDownload = useCallback(() => {
    downloadExpenseSheet(state);
  }, [state]);

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

  const handleDeleteRow = useCallback(
    (id: string) => {
      if (state.rows.length === 1) {
        setPendingDeleteRowId(id);
        setShowDeleteDialog(true);
      } else {
        deleteRow(id);
      }
    },
    [state.rows.length, deleteRow],
  );

  async function handleConfirmDelete() {
    setShowDeleteDialog(false);
    setPendingDeleteRowId(null);
    await deleteSheet();
    router.push("/expense-sheets");
  }

  function handleCancelDelete() {
    setShowDeleteDialog(false);
    setPendingDeleteRowId(null);
  }

  if (!loaded) {
    return (
      <div className="min-h-screen bg-snow flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  const headerTitle = state.name
    ? `${state.name} · Expense Comparison`
    : "Expense Comparison";

  return (
    <div className="min-h-screen bg-snow">
      <header className="border-b border-silver px-4 py-4 md:px-6 md:py-8">
        <div className="max-w-[90rem] mx-auto flex items-center justify-between gap-4">
          <div>
            <Link href="/expense-sheets" className="text-steel text-sm hover:underline">
              &larr; All Sheets
            </Link>
            <h1 className="text-2xl md:text-3xl font-bold text-crimson mt-1">{headerTitle}</h1>
            <p className="text-gray-600 mt-1">
              {state.year1} vs {state.year2}
            </p>
          </div>

          {/* Desktop action buttons */}
          <div className="hidden md:flex items-center gap-3">
            {state.rows.length > 0 && <SaveButton saving={saving} onSave={flushSave} />}
            {state.rows.length === 0 && <UploadButton bulkAddEntries={bulkAddEntries} setRegion={setRegion} />}
            <ShareButton code={code} />
            {state.rows.length > 0 && <DownloadButton state={state} />}
            <button
              onClick={() => setShowDeleteDialog(true)}
              className="px-4 py-2 bg-crimson text-white rounded hover:bg-red-700 transition-colors"
            >
              Delete
            </button>
          </div>

          {/* Mobile hamburger menu */}
          <div className="md:hidden">
            <ActionMenu
              saving={saving}
              onSave={flushSave}
              onShare={handleShare}
              onUploadClick={() => mobileFileInputRef.current?.click()}
              onDownload={handleDownload}
              onDelete={() => setShowDeleteDialog(true)}
              hasRows={state.rows.length > 0}
            />
          </div>
        </div>
      </header>

      {/* Hidden file input for mobile upload action */}
      <input
        ref={mobileFileInputRef}
        type="file"
        accept=".xlsx,.xls,.csv"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) parseExpenseFile(file, bulkAddEntries, setRegion);
          e.target.value = "";
        }}
      />

      <main className="max-w-[90rem] mx-auto px-4 md:px-6 py-8 space-y-6">
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
          onDeleteRow={handleDeleteRow}
          onRegionChange={setRegion}
          onEditCell={handleEditCell}
        />
      </main>

      <DeleteSheetDialog
        open={showDeleteDialog}
        sheetName={state.name || "Expense Comparison"}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />

      <Toast message="Saved!" visible={showToast} />
    </div>
  );
}
