// budget.rs
export enum BudgetStatus {
  Draft = "draft",
  Submitted = "submitted",
  Approved = "approved",
  Rejected = "rejected",
  Archived = "archived",
}

export interface Budget {
  id?: number;
  project_id: number;
  code: string;
  version_number: number;
  name: string;
  status: BudgetStatus;
  created_at?: Date;
  updated_at?: Date;
}
