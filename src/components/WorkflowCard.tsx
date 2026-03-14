import Link from "next/link";
import { Workflow } from "@/types/workflow";

interface Props {
  workflow: Workflow;
  completedCount: number;
}

export function WorkflowCard({ workflow, completedCount }: Props) {
  const totalSteps = workflow.steps.length;
  const pct = totalSteps > 0 ? Math.round((completedCount / totalSteps) * 100) : 0;

  return (
    <Link
      href={`/workflow/${workflow.slug}/step/0`}
      className="block border border-silver rounded-lg p-6 hover:bg-sky-light/20 transition-colors"
    >
      <h2 className="text-xl font-semibold text-crimson mb-2">{workflow.title}</h2>
      <p className="text-gray-600 mb-4">{workflow.description}</p>
      <div className="flex items-center gap-3">
        <div className="flex-1 h-2 bg-silver rounded-full overflow-hidden">
          <div
            className="h-full bg-crimson rounded-full transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
        <span className="text-sm text-gray-500">
          {completedCount}/{totalSteps}
        </span>
      </div>
    </Link>
  );
}
