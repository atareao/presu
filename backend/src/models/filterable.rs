use sqlx::{
    Postgres,
    QueryBuilder,
    types::BigDecimal,
};

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

//Implementación para búsqueda exacta en Booleanos
impl Filterable for Option<bool> {
    fn append_filter(&self, builder: &mut QueryBuilder<Postgres>, column: &str) {
        if let Some(val) = self {
            builder.push(format!(" AND {} = ", column));
            builder.push_bind(*val);
        }
    }
}

//Implementación para búsqueda exacta en f64
impl Filterable for Option<f64> {
    fn append_filter(&self, builder: &mut QueryBuilder<Postgres>, column: &str) {
        if let Some(val) = self {
            builder.push(format!(" AND {} = ", column));
            builder.push_bind(*val);
        }
    }
}

//Implementación para búsqueda exacta en BigDecimal
impl Filterable for Option<BigDecimal> {
    fn append_filter(&self, builder: &mut QueryBuilder<Postgres>, column: &str) {
        if let Some(val) = self {
            builder.push(format!(" AND {} = ", column));
            builder.push_bind(val.clone());
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use sqlx::{Postgres, QueryBuilder, Execute};
    use std::str::FromStr;

    #[test]
    fn test_filterable_string() {
        let mut builder: QueryBuilder<Postgres> = QueryBuilder::new("SELECT * FROM table WHERE 1=1");
        let filter = Some("test".to_string());
        filter.append_filter(&mut builder, "column");
        let query = builder.build();
        assert_eq!(query.sql(), "SELECT * FROM table WHERE 1=1 AND column LIKE $1");
    }

    #[test]
    fn test_filterable_i32() {
        let mut builder: QueryBuilder<Postgres> = QueryBuilder::new("SELECT * FROM table WHERE 1=1");
        let filter = Some(123);
        filter.append_filter(&mut builder, "column");
        let query = builder.build();
        assert_eq!(query.sql(), "SELECT * FROM table WHERE 1=1 AND column = $1");
    }

    #[test]
    fn test_filterable_bool() {
        let mut builder: QueryBuilder<Postgres> = QueryBuilder::new("SELECT * FROM table WHERE 1=1");
        let filter = Some(true);
        filter.append_filter(&mut builder, "column");
        let query = builder.build();
        assert_eq!(query.sql(), "SELECT * FROM table WHERE 1=1 AND column = $1");
    }

    #[test]
    fn test_filterable_f64() {
        let mut builder: QueryBuilder<Postgres> = QueryBuilder::new("SELECT * FROM table WHERE 1=1");
        let filter = Some(123.45);
        filter.append_filter(&mut builder, "column");
        let query = builder.build();
        assert_eq!(query.sql(), "SELECT * FROM table WHERE 1=1 AND column = $1");
    }

    #[test]
    fn test_filterable_big_decimal() {
        let mut builder: QueryBuilder<Postgres> = QueryBuilder::new("SELECT * FROM table WHERE 1=1");
        let filter = Some(BigDecimal::from_str("123.45").unwrap());
        filter.append_filter(&mut builder, "column");
        let query = builder.build();
        assert_eq!(query.sql(), "SELECT * FROM table WHERE 1=1 AND column = $1");
    }
}
