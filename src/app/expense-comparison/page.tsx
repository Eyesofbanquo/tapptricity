"use client";

import { useRouter } from "next/navigation";
import { useExpenseComparison } from "@/hooks/useExpenseComparison";
import { YearSelector } from "@/components/expense-comparison/YearSelector";

export default function ExpenseComparisonPage() {
  const router = useRouter();
  const { createSheet } = useExpenseComparison(null);

  async function handleSetYears(year1: number, year2: number) {
    const code = await createSheet(year1, year2);
    router.push(`/expense-comparison/${code}`);
  }

  return (
    <div className="min-h-screen bg-snow">
      <header className="border-b border-silver px-6 py-8">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold text-crimson">Expense Comparison</h1>
          <p className="text-gray-600 mt-2">
            Compare monthly expenses across two fiscal years.
          </p>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-6 py-8">
        <p className="text-gray-700 mb-6">
          Select the two years you want to compare, then click &quot;Set Years&quot; to create a new comparison sheet.
        </p>
        <YearSelector onSetYears={handleSetYears} />
      </main>
    </div>
  );
}
