"use client";

import { ChecklistStep as ChecklistStepType } from "@/types/workflow";

interface Props {
  step: ChecklistStepType;
  checkedItems: string[];
  onToggle: (itemId: string, checked: boolean) => void;
}

export function ChecklistStep({ step, checkedItems, onToggle }: Props) {
  return (
    <div>
      {step.description && (
        <p className="text-gray-600 mb-4">{step.description}</p>
      )}
      <ul className="space-y-2">
        {step.items.map((item) => {
          const isChecked = checkedItems.includes(item.id);
          return (
            <li key={item.id}>
              <label
                className={`flex items-start gap-3 p-3 rounded border cursor-pointer transition-colors ${
                  isChecked
                    ? "bg-sky-light/30 border-steel"
                    : "border-silver hover:bg-snow"
                }`}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={(e) => onToggle(item.id, e.target.checked)}
                  className="mt-0.5 w-4 h-4 accent-crimson"
                />
                <span className={isChecked ? "line-through text-gray-400" : ""}>
                  {item.label}
                </span>
              </label>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
