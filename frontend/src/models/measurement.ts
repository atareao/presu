// measurement.rs
export interface Measurement {
  id?: number;
  element_id: number;
  price_id: number;
  params_json: Record<string, any>;
  measurement_text?: string | null;
  measured_quantity: number;
  created_at?: Date;
  updated_at?: Date;
}
