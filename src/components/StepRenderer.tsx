"use client";

import { Step } from "@/types/workflow";
import { InfoStep } from "@/components/steps/InfoStep";
import { ChecklistStep } from "@/components/steps/ChecklistStep";
import { FormStep } from "@/components/steps/FormStep";

interface Props {
  step: Step;
  completed: boolean;
  checkedItems: string[];
  formData: Record<string, string>;
  onMarkComplete: () => void;
  onMarkIncomplete: () => void;
  onChecklistToggle: (itemId: string, checked: boolean) => void;
  onFormSave: (data: Record<string, string>) => void;
}

export function StepRenderer({
  step,
  completed,
  checkedItems,
  formData,
  onMarkComplete,
  onMarkIncomplete,
  onChecklistToggle,
  onFormSave,
}: Props) {
  switch (step.type) {
    case "info":
      return (
        <InfoStep
          step={step}
          completed={completed}
          onMarkRead={() => (completed ? onMarkIncomplete() : onMarkComplete())}
        />
      );
    case "checklist":
      return (
        <ChecklistStep
          step={step}
          checkedItems={checkedItems}
          onToggle={onChecklistToggle}
        />
      );
    case "form":
      return (
        <FormStep
          step={step}
          savedData={formData}
          onSave={onFormSave}
          completed={completed}
          onMarkComplete={onMarkComplete}
        />
      );
  }
}
