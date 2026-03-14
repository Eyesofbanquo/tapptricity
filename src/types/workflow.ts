export interface Workflow {
  slug: string;
  title: string;
  description: string;
  steps: Step[];
}

export type Step = InfoStep | ChecklistStep | FormStep;

interface BaseStep {
  id: string;
  title: string;
  description?: string;
}

export interface InfoStep extends BaseStep {
  type: "info";
  content: string;
}

export interface ChecklistStep extends BaseStep {
  type: "checklist";
  items: ChecklistItem[];
}

export interface ChecklistItem {
  id: string;
  label: string;
}

export interface FormStep extends BaseStep {
  type: "form";
  fields: FormField[];
  skippable?: boolean;
  output?: OutputConfig;
}

export interface FormField {
  id: string;
  label: string;
  type: "text" | "number" | "date" | "select" | "textarea";
  required?: boolean;
  placeholder?: string;
  options?: string[]; // for select fields
}

export interface OutputConfig {
  title: string;
  template: string;
}

export interface WorkflowProgress {
  completedSteps: string[];
  formData: Record<string, Record<string, string>>;
  lastVisitedStep: number;
}
