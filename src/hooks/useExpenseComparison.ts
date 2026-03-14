"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { isDevMode } from "@/lib/env";
import type { ExpenseComparisonState, ExpenseRow, MonthName, MonthData } from "@/types/expense-comparison";

const LS_PREFIX = "expense-sheet:";
const LS_CURRENT = "expense-sheet:current";

function generateCode(): string {
  return Math.random().toString(36).substring(2, 8);
}

function emptyState(year1 = 2025, year2 = 2026): ExpenseComparisonState {
  return { year1, year2, rows: [] };
}

export function useExpenseComparison(code: string | null) {
  const [state, setState] = useState<ExpenseComparisonState>(emptyState());
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [currentCode, setCurrentCode] = useState<string | null>(code);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load from Supabase or localStorage
  useEffect(() => {
    if (!currentCode) {
      setLoaded(true);
      return;
    }

    async function load() {
      // Try localStorage first for instant load
      const cached = localStorage.getItem(LS_PREFIX + currentCode);
      if (cached) {
        try {
          setState(JSON.parse(cached));
        } catch { /* ignore parse errors */ }
      }

      // Then fetch from Supabase (skip in dev)
      if (!isDevMode && supabase) {
        const { data } = await supabase
          .from("expense_sheets")
          .select("data")
          .eq("code", currentCode)
          .single();

        if (data?.data) {
          setState(data.data as ExpenseComparisonState);
          localStorage.setItem(LS_PREFIX + currentCode, JSON.stringify(data.data));
        }
      }

      setLoaded(true);
    }

    load();
  }, [currentCode]);

  // Debounced save to Supabase + localStorage
  const persist = useCallback(
    (next: ExpenseComparisonState) => {
      if (!currentCode) return;

      localStorage.setItem(LS_PREFIX + currentCode, JSON.stringify(next));

      setSaving(true);
      if (saveTimer.current) clearTimeout(saveTimer.current);
      if (isDevMode) {
        queueMicrotask(() => setSaving(false));
        return;
      }

      saveTimer.current = setTimeout(async () => {
        if (!supabase) { setSaving(false); return; }
        await supabase
          .from("expense_sheets")
          .update({ data: next, updated_at: new Date().toISOString() })
          .eq("code", currentCode);
        setSaving(false);
      }, 500);
    },
    [currentCode],
  );

  const update = useCallback(
    (fn: (prev: ExpenseComparisonState) => ExpenseComparisonState) => {
      setState((prev) => {
        const next = fn(prev);
        const stamped = { ...next, modifiedAt: new Date().toISOString() };
        persist(stamped);
        return stamped;
      });
    },
    [persist],
  );

  const flushSave = useCallback(async () => {
    if (!currentCode) return;
    if (saveTimer.current) {
      clearTimeout(saveTimer.current);
      saveTimer.current = null;
    }
    if (isDevMode || !supabase) {
      setSaving(true);
      queueMicrotask(() => setSaving(false));
      return;
    }

    const data = JSON.parse(localStorage.getItem(LS_PREFIX + currentCode) || "null");
    if (!data) return;

    setSaving(true);
    await supabase
      .from("expense_sheets")
      .update({ data, updated_at: new Date().toISOString() })
      .eq("code", currentCode);
    setSaving(false);
  }, [currentCode]);

  const deleteSheet = useCallback(async () => {
    if (!currentCode) return;

    localStorage.removeItem(LS_PREFIX + currentCode);

    const storedCurrent = localStorage.getItem(LS_CURRENT);
    if (storedCurrent === currentCode) {
      localStorage.removeItem(LS_CURRENT);
    }

    if (!isDevMode && supabase) {
      await supabase
        .from("expense_sheets")
        .delete()
        .eq("code", currentCode);
    }
  }, [currentCode]);

  const setYears = useCallback(
    (year1: number, year2: number) => {
      update((prev) => ({ ...prev, year1, year2 }));
    },
    [update],
  );

  const addEntry = useCallback(
    (expenseName: string, accountCode: string, month: MonthName, monthData: MonthData) => {
      update((prev) => {
        const rowKey = `${expenseName}::${accountCode}`;
        const existingIdx = prev.rows.findIndex(
          (r) => `${r.expenseName}::${r.accountCode}` === rowKey,
        );

        let rows: ExpenseRow[];
        if (existingIdx >= 0) {
          rows = prev.rows.map((r, i) =>
            i === existingIdx
              ? { ...r, months: { ...r.months, [month]: monthData } }
              : r,
          );
        } else {
          const newRow: ExpenseRow = {
            id: crypto.randomUUID(),
            expenseName,
            accountCode,
            months: { [month]: monthData },
          };
          rows = [...prev.rows, newRow];
        }

        return { ...prev, rows };
      });
    },
    [update],
  );

  const bulkAddEntries = useCallback(
    (entries: { expenseName: string; accountCode: string; month: MonthName; data: MonthData }[]) => {
      update((prev) => {
        const rows = [...prev.rows];
        for (const entry of entries) {
          const rowKey = `${entry.expenseName}::${entry.accountCode}`;
          const idx = rows.findIndex((r) => `${r.expenseName}::${r.accountCode}` === rowKey);
          if (idx >= 0) {
            rows[idx] = { ...rows[idx], months: { ...rows[idx].months, [entry.month]: entry.data } };
          } else {
            rows.push({
              id: crypto.randomUUID(),
              expenseName: entry.expenseName,
              accountCode: entry.accountCode,
              months: { [entry.month]: entry.data },
            });
          }
        }
        return { ...prev, rows };
      });
    },
    [update],
  );

  const deleteRow = useCallback(
    (id: string) => {
      update((prev) => ({
        ...prev,
        rows: prev.rows.filter((r) => r.id !== id),
      }));
    },
    [update],
  );

  const setRegion = useCallback(
    (region: string) => {
      update((prev) => ({ ...prev, region }));
    },
    [update],
  );

  // Create a new sheet, returns the code
  const createSheet = useCallback(
    async (year1: number, year2: number, name?: string): Promise<string> => {
      const newCode = generateCode();
      const now = new Date().toISOString();
      const initial: ExpenseComparisonState = {
        ...emptyState(year1, year2),
        name,
        createdAt: now,
        modifiedAt: now,
      };

      if (!isDevMode && supabase) {
        await supabase
          .from("expense_sheets")
          .insert({ code: newCode, data: initial });
      }

      localStorage.setItem(LS_PREFIX + newCode, JSON.stringify(initial));
      localStorage.setItem(LS_CURRENT, newCode);
      setCurrentCode(newCode);
      setState(initial);
      return newCode;
    },
    [],
  );

  return {
    state,
    loaded,
    saving,
    currentCode,
    setYears,
    addEntry,
    bulkAddEntries,
    deleteRow,
    setRegion,
    createSheet,
    flushSave,
    deleteSheet,
  };
}
