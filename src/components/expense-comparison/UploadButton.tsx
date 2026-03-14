"use client";

import { useRef } from "react";
import * as XLSX from "xlsx";
import type { MonthName, MonthData } from "@/types/expense-comparison";

interface UploadButtonProps {
  bulkAddEntries: (entries: { expenseName: string; accountCode: string; month: MonthName; data: MonthData }[]) => void;
  setRegion: (region: string) => void;
}

const SHORT_TO_FULL: Record<string, MonthName> = {
  Jan: "January", Feb: "February", Mar: "March", Apr: "April",
  May: "May", Jun: "June", Jul: "July", Aug: "August",
  Sep: "September", Oct: "October", Nov: "November", Dec: "December",
};

function parseMonthFromLabel(label: string): MonthName | null {
  const short = label.split("-")[0];
  return SHORT_TO_FULL[short] ?? null;
}

function toNumberOrNull(val: unknown): number | null {
  if (val === null || val === undefined || val === "") return null;
  const n = Number(val);
  return Number.isFinite(n) ? n : null;
}

export function UploadButton({ bulkAddEntries, setRegion }: UploadButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFile(file: File) {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const buffer = e.target?.result;
        if (!buffer) return;

        const wb = XLSX.read(buffer, { type: "array" });
        const sheet = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1 });

        // Find header row
        const headerIdx = rows.findIndex(
          (r) => Array.isArray(r) && String(r[0]).trim() === "Expense" && String(r[1]).trim() === "Acct Code",
        );

        if (headerIdx < 0) {
          alert("Could not find header row. Expected 'Expense' and 'Acct Code' columns.");
          return;
        }

        // Extract region from the row before header if present
        if (headerIdx > 0) {
          const regionRow = rows[headerIdx - 1] as unknown[];
          if (String(regionRow?.[0]).trim() === "Region #" && regionRow?.[1]) {
            setRegion(String(regionRow[1]).trim());
          }
        }

        const header = rows[headerIdx] as string[];

        // Parse month columns: groups of 3 starting at index 2
        const monthColumns: { month: MonthName; colStart: number }[] = [];
        for (let col = 2; col + 2 < header.length; col += 3) {
          const label = String(header[col] ?? "");
          const month = parseMonthFromLabel(label);
          if (month) {
            monthColumns.push({ month, colStart: col });
          }
        }

        // Parse data rows
        const entries: { expenseName: string; accountCode: string; month: MonthName; data: MonthData }[] = [];

        for (let i = headerIdx + 1; i < rows.length; i++) {
          const row = rows[i] as unknown[];
          if (!row) continue;

          const expenseName = String(row[0] ?? "").trim();
          const accountCode = String(row[1] ?? "").trim();
          if (!expenseName || !accountCode) continue;

          for (const { month, colStart } of monthColumns) {
            const year1Amount = toNumberOrNull(row[colStart]);
            const year2Amount = toNumberOrNull(row[colStart + 1]);
            // Skip diff column (colStart + 2)

            if (year1Amount !== null || year2Amount !== null) {
              entries.push({ expenseName, accountCode, month, data: { year1Amount, year2Amount } });
            }
          }
        }

        if (entries.length === 0) {
          alert("No data rows found in the file.");
          return;
        }

        bulkAddEntries(entries);
      } catch {
        alert("Failed to read the file. Please check that it is a valid spreadsheet.");
      }
    };
    reader.readAsArrayBuffer(file);
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept=".xlsx,.xls,.csv"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          // Reset so re-uploading the same file triggers onChange
          e.target.value = "";
        }}
      />
      <button
        onClick={() => inputRef.current?.click()}
        className="px-4 py-2 bg-steel text-white rounded hover:bg-steel/90 transition-colors"
      >
        Upload Spreadsheet
      </button>
    </>
  );
}
