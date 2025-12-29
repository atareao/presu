// element.rs
export enum ElementType {
  Chapter = "chapter",
  Line = "line",
}

export interface Element {
  id?: number;
  budget_id: number;
  parent_id?: number | null;
  version_id: number;
  element_type: ElementType;
  code: string;
  budget_code: string;
  description?: string | null;
  created_at?: Date;
  updated_at?: Date;
}
