// backend/src/models/unit.rs
export interface Unit {
  id: number;
  name: string;
  symbol: string;
  description?: string;
  formula: string;
  created_at?: Date;
  updated_at?: Date;
}
