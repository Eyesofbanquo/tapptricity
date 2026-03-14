"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { isDevMode } from "@/lib/env";
import type { ExpenseComparisonState } from "@/types/expense-comparison";

interface SheetSummary {
  code: string;
  name: string;
  year1: number;
  year2: number;
  date: string;
  sortKey: string;
}

function loadSheetsFromLocalStorage(): SheetSummary[] {
  const sheets: SheetSummary[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key?.startsWith("expense-sheet:") || key === "expense-sheet:current") continue;
    const code = key.replace("expense-sheet:", "");
    try {
      const data: ExpenseComparisonState = JSON.parse(localStorage.getItem(key) || "");
      const sortKey = data.modifiedAt || data.createdAt || "";
      sheets.push({
        code,
        name: data.name || "Expense Comparison",
        year1: data.year1,
        year2: data.year2,
        date: data.createdAt
          ? new Date(data.createdAt).toLocaleDateString()
          : "",
        sortKey,
      });
    } catch { /* ignore */ }
  }
  sheets.sort((a, b) => (b.sortKey > a.sortKey ? 1 : -1));
  return sheets;
}

async function loadSheetsFromSupabase(): Promise<SheetSummary[]> {
  if (!supabase) return [];
  const { data } = await supabase
    .from("expense_sheets")
    .select("code, data, updated_at")
    .order("updated_at", { ascending: false });

  if (!data) return [];

  return data.map((row) => {
    const state = row.data as ExpenseComparisonState;
    return {
      code: row.code,
      name: state?.name || "Expense Comparison",
      year1: state?.year1 ?? 0,
      year2: state?.year2 ?? 0,
      date: state?.createdAt
        ? new Date(state.createdAt).toLocaleDateString()
        : row.updated_at
          ? new Date(row.updated_at).toLocaleDateString()
          : "",
      sortKey: row.updated_at || "",
    };
  });
}

export default function ExpenseSheetsPage() {
  const [sheets, setSheets] = useState<SheetSummary[]>([]);
  const [currentSheet, setCurrentSheet] = useState<SheetSummary | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    async function load() {
      // Load current sheet pointer
      const currentCode = localStorage.getItem("expense-sheet:current");
      if (currentCode) {
        const cached = localStorage.getItem("expense-sheet:" + currentCode);
        if (cached) {
          try {
            const data: ExpenseComparisonState = JSON.parse(cached);
            setCurrentSheet({
              code: currentCode,
              name: data.name || "Expense Comparison",
              year1: data.year1,
              year2: data.year2,
              date: "",
              sortKey: "",
            });
          } catch { /* ignore */ }
        }
      }

      // Load all sheets
      const allSheets = isDevMode
        ? loadSheetsFromLocalStorage()
        : await loadSheetsFromSupabase();
      setSheets(allSheets);
      setLoaded(true);
    }

    load();
  }, []);

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
        <div className="max-w-3xl mx-auto">
          <Link href="/" className="text-steel text-sm hover:underline">
            &larr; Home
          </Link>
          <h1 className="text-3xl font-bold text-crimson mt-1">Expense Sheets</h1>
          <p className="text-gray-600 mt-2">
            Browse and manage your saved expense sheets.
          </p>
        </div>
      </header>
      <main className="max-w-3xl mx-auto px-6 py-8">
        {currentSheet && (
          <section className="mb-8">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">
              Go to {currentSheet.name} sheet
            </h2>
            <Link
              href={`/expense-comparison/${currentSheet.code}`}
              className="block border border-silver rounded-lg p-6 hover:border-steel transition-colors"
            >
              <h3 className="text-lg font-semibold text-crimson">{currentSheet.name}</h3>
              <p className="text-gray-600 mt-1 text-sm">
                {currentSheet.year1} vs {currentSheet.year2}
              </p>
            </Link>
          </section>
        )}

        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-700">Most Recent</h2>
            <Link
              href="/expense-comparison"
              className="px-4 py-2 border border-silver rounded hover:bg-gray-100 transition-colors text-sm"
            >
              + New Sheet
            </Link>
          </div>
          {sheets.length === 0 ? (
            <p className="text-gray-500">
              No sheets yet.{" "}
              <Link href="/expense-comparison" className="text-steel hover:underline">
                Create one
              </Link>
              .
            </p>
          ) : (
            <div className="space-y-4">
              {sheets.map((sheet) => (
                <Link
                  key={sheet.code}
                  href={`/expense-comparison/${sheet.code}`}
                  className="block border border-silver rounded-lg p-6 hover:border-steel transition-colors"
                >
                  <h3 className="text-lg font-semibold text-crimson">{sheet.name}</h3>
                  <p className="text-gray-600 mt-1 text-sm">
                    {sheet.year1} vs {sheet.year2}
                    {sheet.date && <span className="ml-3 text-gray-400">{sheet.date}</span>}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
