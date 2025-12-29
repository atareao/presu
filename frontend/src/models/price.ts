// price.rs
export enum PriceType {
  Base = "base",
  Decomposed = "decomposed",
}

export interface Price {
  id?: number;
  version_id: number;
  code: string;
  description: string;
  base_price: number;
  unit_id: number;
  price_type: PriceType;
  created_at?: Date;
  updated_at?: Date;
}
