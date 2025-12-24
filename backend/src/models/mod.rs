mod descomposition;
mod element;
mod measurement;
mod price;
mod project;
mod role;
pub mod unit;
mod user;
mod version;
mod budget;
mod data;
mod response;
mod filterable;
mod paginable;

pub type UtcTimestamp = chrono::DateTime<chrono::Utc>;
pub type Error = Box<dyn std::error::Error>;
pub use filterable::Filterable;
pub use paginable::Paginable;

pub use data::Data;
pub use response::{
    ApiResponse,
    CustomResponse,
    EmptyResponse,
    PagedResponse,
    Pagination,
};

use sqlx::postgres::PgPool;

pub struct AppState {
    pub pool: PgPool,
    pub secret: String,
    pub static_dir: String,
}
