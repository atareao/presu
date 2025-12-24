use sqlx::{Postgres, QueryBuilder};

pub trait Filterable {
    fn append_filter(&self, builder: &mut QueryBuilder<Postgres>, column: &str);
}

// Implementación para búsqueda parcial en Strings
impl Filterable for Option<String> {
    fn append_filter(&self, builder: &mut QueryBuilder<Postgres>, column: &str) {
        if let Some(val) = self {
            builder.push(format!(" AND {} LIKE ", column));
            builder.push_bind(format!("%{}%", val));
        }
    }
}

// Implementación para búsqueda exacta en Enteros
impl Filterable for Option<i32> {
    fn append_filter(&self, builder: &mut QueryBuilder<Postgres>, column: &str) {
        if let Some(val) = self {
            builder.push(format!(" AND {} = ", column));
            builder.push_bind(*val);
        }
    }
}

