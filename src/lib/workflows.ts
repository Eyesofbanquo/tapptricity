import { Workflow } from "@/types/workflow";
import { workflowSlugs } from "@/data/workflows/_index";
import invoicePreparation from "@/data/workflows/invoice-preparation.json";

const workflowMap: Record<string, Workflow> = {
  "invoice-preparation": invoicePreparation as Workflow,
};

export function getWorkflow(slug: string): Workflow | undefined {
  return workflowMap[slug];
}

export function getAllWorkflows(): Workflow[] {
  return workflowSlugs.map((slug) => workflowMap[slug]).filter(Boolean);
}
