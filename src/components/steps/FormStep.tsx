"use client";

import { useState, useEffect } from "react";
import { FormStep as FormStepType } from "@/types/workflow";
import { FormOutput } from "@/components/FormOutput";
import { renderTemplate } from "@/lib/output";

interface Props {
  step: FormStepType;
  savedData: Record<string, string>;
  onSave: (data: Record<string, string>) => void;
  completed: boolean;
  onMarkComplete: () => void;
}

export function FormStep({ step, savedData, onSave, completed, onMarkComplete }: Props) {
  const [formData, setFormData] = useState<Record<string, string>>(savedData);
  const [showOutput, setShowOutput] = useState(false);

  // Sync from savedData on mount
  useEffect(() => {
    if (Object.keys(savedData).length > 0) {
      setFormData(savedData);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleChange = (fieldId: string, value: string) => {
    const next = { ...formData, [fieldId]: value };
    setFormData(next);
    onSave(next);
  };

  const requiredFields = step.fields.filter((f) => f.required);
  const allRequiredFilled = requiredFields.every(
    (f) => formData[f.id] && formData[f.id].trim() !== ""
  );

  const handleGenerate = () => {
    setShowOutput(true);
    if (!completed) onMarkComplete();
  };

  return (
    <div>
      {step.description && (
        <p className="text-gray-600 mb-4">{step.description}</p>
      )}
      <div className="space-y-4">
        {step.fields.map((field) => (
          <div key={field.id}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {field.label}
              {field.required && <span className="text-crimson ml-1">*</span>}
            </label>
            {field.type === "select" ? (
              <select
                value={formData[field.id] || ""}
                onChange={(e) => handleChange(field.id, e.target.value)}
                className="w-full border border-silver rounded px-3 py-2 bg-white focus:outline-none focus:border-steel"
              >
                <option value="">Select...</option>
                {field.options?.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            ) : field.type === "textarea" ? (
              <textarea
                value={formData[field.id] || ""}
                onChange={(e) => handleChange(field.id, e.target.value)}
                placeholder={field.placeholder}
                rows={3}
                className="w-full border border-silver rounded px-3 py-2 focus:outline-none focus:border-steel"
              />
            ) : (
              <input
                type={field.type}
                value={formData[field.id] || ""}
                onChange={(e) => handleChange(field.id, e.target.value)}
                placeholder={field.placeholder}
                className="w-full border border-silver rounded px-3 py-2 focus:outline-none focus:border-steel"
              />
            )}
          </div>
        ))}
      </div>

      {step.output && (
        <div className="mt-4">
          {allRequiredFilled ? (
            <button
              onClick={handleGenerate}
              className="px-4 py-2 bg-crimson text-snow rounded hover:bg-crimson/90 transition-colors"
            >
              Generate Output
            </button>
          ) : (
            <p className="text-sm text-gray-400">
              Fill all required fields to generate output.
            </p>
          )}
          {showOutput && (
            <FormOutput
              title={step.output.title}
              text={renderTemplate(step.output.template, formData)}
            />
          )}
        </div>
      )}

      {!step.output && (
        <button
          onClick={onMarkComplete}
          className={`mt-4 px-4 py-2 rounded transition-colors ${
            completed
              ? "bg-sky-light/50 text-steel border border-steel"
              : "bg-crimson text-snow hover:bg-crimson/90"
          }`}
        >
          {completed ? "Completed" : "Mark as Complete"}
        </button>
      )}
    </div>
  );
}
