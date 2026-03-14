"use client";

import { use, useCallback } from "react";
import Link from "next/link";
import { getWorkflow } from "@/lib/workflows";
import { useWorkflowProgress } from "@/hooks/useWorkflowProgress";
import { StepRenderer } from "@/components/StepRenderer";
import { StepNav } from "@/components/StepNav";
import { ProgressBar } from "@/components/ProgressBar";
import { ChecklistStep } from "@/types/workflow";

interface Props {
  params: Promise<{ slug: string; stepIndex: string }>;
}

export default function StepPage({ params }: Props) {
  const { slug, stepIndex: stepIndexStr } = use(params);
  const stepIndex = parseInt(stepIndexStr, 10);
  const workflow = getWorkflow(slug);
  const {
    progress,
    loaded,
    markStepComplete,
    markStepIncomplete,
    saveFormData,
    setLastVisitedStep,
    resetProgress,
  } = useWorkflowProgress(slug);

  if (!workflow) {
    return (
      <div className="min-h-screen bg-snow flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-crimson mb-2">Workflow Not Found</h1>
          <Link href="/" className="text-steel hover:underline">Back to Home</Link>
        </div>
      </div>
    );
  }

  const step = workflow.steps[stepIndex];
  if (!step) {
    return (
      <div className="min-h-screen bg-snow flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-crimson mb-2">Step Not Found</h1>
          <Link href="/" className="text-steel hover:underline">Back to Home</Link>
        </div>
      </div>
    );
  }

  // Track visited step
  if (loaded && stepIndex !== progress.lastVisitedStep) {
    setLastVisitedStep(stepIndex);
  }

  const isCompleted = progress.completedSteps.includes(step.id);

  // For checklist steps, items are stored as formData keys
  const checkedItems = Object.keys(progress.formData[step.id] || {}).filter(
    (k) => progress.formData[step.id][k] === "true"
  );

  // Checklist is complete when all items checked
  const isChecklistComplete =
    step.type === "checklist" &&
    (step as ChecklistStep).items.every((item) => checkedItems.includes(item.id));

  // Auto-complete/uncomplete checklist steps
  if (step.type === "checklist" && isChecklistComplete && !isCompleted) {
    markStepComplete(step.id);
  }
  if (step.type === "checklist" && !isChecklistComplete && isCompleted) {
    markStepIncomplete(step.id);
  }

  const canProceed =
    isCompleted ||
    isChecklistComplete ||
    (step.type === "form" && step.skippable === true);

  const handleChecklistToggle = useCallback(
    (itemId: string, checked: boolean) => {
      const current = progress.formData[step.id] || {};
      const next = { ...current };
      if (checked) {
        next[itemId] = "true";
      } else {
        delete next[itemId];
      }
      saveFormData(step.id, next);
    },
    [progress.formData, step.id, saveFormData]
  );

  const handleFormSave = useCallback(
    (data: Record<string, string>) => {
      saveFormData(step.id, data);
    },
    [step.id, saveFormData]
  );

  const handleSkip = () => {
    markStepComplete(step.id);
  };

  if (!loaded) {
    return (
      <div className="min-h-screen bg-snow flex items-center justify-center">
        <p className="text-gray-400">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-snow">
      <header className="border-b border-silver px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-crimson font-bold text-lg hover:underline">
            Apptricity Guide
          </Link>
          <button
            onClick={resetProgress}
            className="text-sm text-gray-400 hover:text-crimson transition-colors"
          >
            Reset Progress
          </button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">{workflow.title}</h1>
          <ProgressBar
            completed={progress.completedSteps.length}
            total={workflow.steps.length}
          />
        </div>

        <div className="flex gap-6">
          {/* Step sidebar */}
          <nav className="hidden md:block w-56 shrink-0">
            <ul className="space-y-1">
              {workflow.steps.map((s, i) => {
                const done = progress.completedSteps.includes(s.id);
                const active = i === stepIndex;
                return (
                  <li key={s.id}>
                    <Link
                      href={`/workflow/${slug}/step/${i}`}
                      className={`block px-3 py-2 text-sm rounded transition-colors ${
                        active
                          ? "border-l-2 border-crimson bg-snow font-medium text-crimson"
                          : "text-gray-600 hover:bg-silver/30"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        {done && (
                          <svg className="w-4 h-4 text-steel shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                        <span className={done && !active ? "text-gray-400" : ""}>
                          {i + 1}. {s.title}
                        </span>
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Step content */}
          <main className="flex-1 min-w-0">
            <div className="border border-silver rounded-lg p-6 bg-white">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm text-steel font-medium">
                  Step {stepIndex + 1} of {workflow.steps.length}
                </span>
                <span className="text-sm text-silver">|</span>
                <span className="text-sm text-gray-400 capitalize">{step.type}</span>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                {step.title}
              </h2>

              <StepRenderer
                step={step}
                completed={isCompleted}
                checkedItems={checkedItems}
                formData={progress.formData[step.id] || {}}
                onMarkComplete={() => markStepComplete(step.id)}
                onMarkIncomplete={() => markStepIncomplete(step.id)}
                onChecklistToggle={handleChecklistToggle}
                onFormSave={handleFormSave}
              />

              <StepNav
                slug={slug}
                stepIndex={stepIndex}
                totalSteps={workflow.steps.length}
                canProceed={canProceed}
                skippable={step.type === "form" && step.skippable}
                onSkip={handleSkip}
              />
            </div>

            {/* Mobile step list */}
            <div className="md:hidden mt-4">
              <details className="border border-silver rounded-lg">
                <summary className="px-4 py-2 text-sm text-steel cursor-pointer">
                  All Steps
                </summary>
                <ul className="px-4 pb-3 space-y-1">
                  {workflow.steps.map((s, i) => {
                    const done = progress.completedSteps.includes(s.id);
                    return (
                      <li key={s.id}>
                        <Link
                          href={`/workflow/${slug}/step/${i}`}
                          className={`block py-1 text-sm ${
                            i === stepIndex ? "text-crimson font-medium" : "text-gray-600"
                          }`}
                        >
                          {done ? "✓ " : ""}{i + 1}. {s.title}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </details>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
