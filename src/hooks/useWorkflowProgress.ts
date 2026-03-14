"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { WorkflowProgress } from "@/types/workflow";

const STORAGE_PREFIX = "workflow-progress:";
const DEBOUNCE_MS = 300;

const defaultProgress: WorkflowProgress = {
  completedSteps: [],
  formData: {},
  lastVisitedStep: 0,
};

export function useWorkflowProgress(slug: string) {
  const [progress, setProgress] = useState<WorkflowProgress>(defaultProgress);
  const [loaded, setLoaded] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const storageKey = `${STORAGE_PREFIX}${slug}`;

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        setProgress(JSON.parse(stored));
      }
    } catch {
      // ignore parse errors
    }
    setLoaded(true);
  }, [storageKey]);

  // Debounced save
  const persist = useCallback(
    (next: WorkflowProgress) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        localStorage.setItem(storageKey, JSON.stringify(next));
      }, DEBOUNCE_MS);
    },
    [storageKey]
  );

  const update = useCallback(
    (updater: (prev: WorkflowProgress) => WorkflowProgress) => {
      setProgress((prev) => {
        const next = updater(prev);
        persist(next);
        return next;
      });
    },
    [persist]
  );

  const markStepComplete = useCallback(
    (stepId: string) => {
      update((prev) => ({
        ...prev,
        completedSteps: prev.completedSteps.includes(stepId)
          ? prev.completedSteps
          : [...prev.completedSteps, stepId],
      }));
    },
    [update]
  );

  const markStepIncomplete = useCallback(
    (stepId: string) => {
      update((prev) => ({
        ...prev,
        completedSteps: prev.completedSteps.filter((id) => id !== stepId),
      }));
    },
    [update]
  );

  const saveFormData = useCallback(
    (stepId: string, data: Record<string, string>) => {
      update((prev) => ({
        ...prev,
        formData: { ...prev.formData, [stepId]: data },
      }));
    },
    [update]
  );

  const setLastVisitedStep = useCallback(
    (stepIndex: number) => {
      update((prev) => ({ ...prev, lastVisitedStep: stepIndex }));
    },
    [update]
  );

  const resetProgress = useCallback(() => {
    localStorage.removeItem(storageKey);
    setProgress(defaultProgress);
  }, [storageKey]);

  return {
    progress,
    loaded,
    markStepComplete,
    markStepIncomplete,
    saveFormData,
    setLastVisitedStep,
    resetProgress,
  };
}
