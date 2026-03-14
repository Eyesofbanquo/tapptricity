"use client";

import { useEffect, useRef, useState } from "react";
import { MONTH_NAMES } from "@/types/expense-comparison";
import type { MonthName, MonthData } from "@/types/expense-comparison";
import { EXPENSE_NAMES, ACCOUNT_CODES } from "@/data/expense-options";

export interface EditTarget {
  expenseName: string;
  accountCode: string;
  month: MonthName;
  year1Amount: number | null;
  year2Amount: number | null;
}

interface AddEntryModalProps {
  year1: number;
  year2: number;
  onAdd: (expenseName: string, accountCode: string, month: MonthName, data: MonthData) => void;
  editTarget?: EditTarget | null;
  onClose?: () => void;
}

function parseAmount(val: string): number | null {
  const trimmed = val.trim();
  if (trimmed === "" ) return null;
  if (trimmed.toLowerCase() === "n/a") return 0;
  const num = Number(trimmed.replace(/[,$]/g, ""));
  return isNaN(num) ? null : num;
}

export function AddEntryModal({ year1, year2, onAdd, editTarget, onClose }: AddEntryModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [expenseName, setExpenseName] = useState<string>(EXPENSE_NAMES[0]);
  const [accountCode, setAccountCode] = useState<string>(ACCOUNT_CODES[0]);
  const [customCode, setCustomCode] = useState("");
  const [isOtherCode, setIsOtherCode] = useState(false);
  const [month, setMonth] = useState<MonthName>("January");
  const [amount1, setAmount1] = useState("");
  const [amount2, setAmount2] = useState("");

  const isEditMode = !!editTarget;

  useEffect(() => {
    if (editTarget) {
      setExpenseName(editTarget.expenseName);
      const isKnownCode = (ACCOUNT_CODES as readonly string[]).includes(editTarget.accountCode);
      if (isKnownCode) {
        setAccountCode(editTarget.accountCode);
        setIsOtherCode(false);
        setCustomCode("");
      } else {
        setIsOtherCode(true);
        setAccountCode("");
        setCustomCode(editTarget.accountCode);
      }
      setMonth(editTarget.month);
      setAmount1(editTarget.year1Amount != null ? String(editTarget.year1Amount) : "");
      setAmount2(editTarget.year2Amount != null ? String(editTarget.year2Amount) : "");
      dialogRef.current?.showModal();
    }
  }, [editTarget]);

  function reset() {
    setExpenseName(EXPENSE_NAMES[0]);
    setAccountCode(ACCOUNT_CODES[0]);
    setCustomCode("");
    setIsOtherCode(false);
    setMonth("January");
    setAmount1("");
    setAmount2("");
  }

  function handleClose() {
    reset();
    dialogRef.current?.close();
    onClose?.();
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const data: MonthData = {
      year1Amount: parseAmount(amount1),
      year2Amount: parseAmount(amount2),
    };

    const code = isOtherCode ? customCode.trim() : accountCode;
    if (!code) return;

    onAdd(expenseName, code, month, data);
    handleClose();
  }

  function handleAccountChange(val: string) {
    if (val === "__other__") {
      setIsOtherCode(true);
      setAccountCode("");
    } else {
      setIsOtherCode(false);
      setAccountCode(val);
    }
  }

  const inputClass = "w-full border border-silver rounded px-3 py-2 focus:outline-none focus:border-steel";

  return (
    <>
      <button
        onClick={() => dialogRef.current?.showModal()}
        className="px-4 py-2 bg-steel text-white rounded hover:bg-steel/90 transition-colors"
      >
        Add Entry
      </button>

      <dialog
        ref={dialogRef}
        className="rounded-lg p-0 shadow-xl backdrop:bg-black/30 max-w-md w-full"
      >
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <h2 className="text-xl font-bold text-crimson">{isEditMode ? "Edit Entry" : "Add Entry"}</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Expense</label>
            <select
              value={expenseName}
              onChange={(e) => setExpenseName(e.target.value)}
              disabled={isEditMode}
              className={`${inputClass} ${isEditMode ? "bg-gray-100 cursor-not-allowed" : ""}`}
            >
              {EXPENSE_NAMES.map((name) => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Account Code</label>
            <select
              value={isOtherCode ? "__other__" : accountCode}
              onChange={(e) => handleAccountChange(e.target.value)}
              disabled={isEditMode}
              className={`${inputClass} ${isEditMode ? "bg-gray-100 cursor-not-allowed" : ""}`}
            >
              {ACCOUNT_CODES.map((code) => (
                <option key={code} value={code}>{code}</option>
              ))}
              <option value="__other__">Other</option>
            </select>
            {isOtherCode && (
              <input
                type="text"
                value={customCode}
                onChange={(e) => setCustomCode(e.target.value)}
                placeholder="Enter account code"
                className={`${inputClass} mt-2`}
                required
              />
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
            <select
              value={month}
              onChange={(e) => setMonth(e.target.value as MonthName)}
              className={inputClass}
            >
              {MONTH_NAMES.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {year1} Amount
              </label>
              <input
                type="text"
                value={amount1}
                onChange={(e) => setAmount1(e.target.value)}
                placeholder="0.00 or N/A"
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {year2} Amount
              </label>
              <input
                type="text"
                value={amount2}
                onChange={(e) => setAmount2(e.target.value)}
                placeholder="0.00 or N/A"
                className={inputClass}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 border border-silver rounded hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-crimson text-white rounded hover:bg-crimson/90 transition-colors"
            >
              {isEditMode ? "Update" : "Add"}
            </button>
          </div>
        </form>
      </dialog>
    </>
  );
}
