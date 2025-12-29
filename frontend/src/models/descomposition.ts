// descomposition.rs
export enum CalculationMode {
  Fixed = "fixed",
  Formula = "formula",
}

export interface Descomposition {
  id?: number;
  parent_price_id: number;
  component_price_id: number;
  calculation_mode: CalculationMode;
  fixed_quantity?: number | null;
  params_json?: Record<string, any> | null; // Mapeo de serde_json::Value
  created_at?: Date;
  updated_at?: Date;
}
