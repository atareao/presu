use sqlx::{
    postgres::PgPoolOptions,
    migrate::Migrator,
    PgPool,
};
use dotenv::dotenv;
use std::env;
use once_cell::sync::Lazy;

pub static TRACING: Lazy<()> = Lazy::new(|| {
    dotenv().ok();
    let log_level = env::var("RUST_LOG").unwrap_or("debug".to_string());
    tracing_subscriber::FmtSubscriber::builder()
        .with_env_filter(log_level)
        .init();
});

pub async fn setup_pool() -> PgPool {
    dotenv().ok();
    let database_url = env::var("DATABASE_URL").expect("DATABASE_URL must be set");
    PgPoolOptions::new()
        .max_connections(1)
        .connect(&database_url)
        .await
        .expect("Failed to create pool.")
}
