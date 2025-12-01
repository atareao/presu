use sqlx::FromRow;
use serde::{Serialize, Deserialize};
use serde_json::Value;

// Tipo utilizado para las fechas TIMESTAMP WITH TIME ZONE
type UtcTimestamp = chrono::DateTime<chrono::Utc>;

/// Representa una fila en la tabla 'decompositions'
#[derive(Debug, FromRow, Serialize, Deserialize)]
pub struct Decomposition {
    pub id: i32,
    
    // El ID del precio principal descompuesto
    pub parent_price_id: i32, 
    
    // El ID del componente (ingrediente)
    pub component_price_id: i32, 
    
    // Mapeamos el ENUM calculation_mode_enum a String
    pub calculation_mode: String, 
    
    // Cantidad fija (NULL si calculation_mode es 'formula')
    pub fixed_quantity: Option<f64>, 
    
    // Parámetros JSON (NULL si calculation_mode es 'fixed')
    pub params_json: Option<Value>, 

    // Campos de Auditoría
    pub created_at: UtcTimestamp,
    pub updated_at: UtcTimestamp,
    pub created_by: i32, 
    pub updated_by: i32, 
}
