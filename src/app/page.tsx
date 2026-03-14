"use client";

import { getAllWorkflows } from "@/lib/workflows";
import { WorkflowCard } from "@/components/WorkflowCard";
import { ToolCard } from "@/components/ToolCard";
import { useWorkflowProgress } from "@/hooks/useWorkflowProgress";

function WorkflowCardWithProgress({ workflow }: { workflow: ReturnType<typeof getAllWorkflows>[number] }) {
  const { progress, loaded } = useWorkflowProgress(workflow.slug);
  if (!loaded) return null;
  return (
    <WorkflowCard
      workflow={workflow}
      completedCount={progress.completedSteps.length}
    />
  );
}

export default function Home() {
  const workflows = getAllWorkflows();

  return (
    <div className="min-h-screen bg-snow">
      <header className="border-b border-silver px-6 py-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold text-crimson">Apptricity Guide</h1>
          <p className="text-gray-600 mt-2">
            Interactive step-by-step guides for Apptricity procedures.
          </p>
        </div>
      </header>
      <main className="max-w-3xl mx-auto px-6 py-8">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Workflows</h2>
        <div className="space-y-4">
          {workflows.map((wf) => (
            <WorkflowCardWithProgress key={wf.slug} workflow={wf} />
          ))}
        </div>

        <h2 className="text-lg font-semibold text-gray-700 mb-4 mt-10">Tools</h2>
        <div className="space-y-4">
          <ToolCard
            title="Create Expense Sheet"
            description="Create a new expense comparison sheet to track monthly expenses across two fiscal years."
            href="/expense-comparison"
          />
          <ToolCard
            title="View All Expense Sheets"
            description="Browse and manage your saved expense sheets."
            href="/expense-sheets"
          />
        </div>
      </main>
    </div>
  );
}
