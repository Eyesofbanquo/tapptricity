export const workflowSlugs = ["invoice-preparation"] as const;

export type WorkflowSlug = (typeof workflowSlugs)[number];
