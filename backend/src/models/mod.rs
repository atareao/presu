mod descomposition;
mod element;
mod measurement;
mod price;
pub mod project;
mod role;
mod unit;
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

pub use unit::Unit;
pub use version::Version;
pub use project::Project;
pub use budget::Budget;
pub use descomposition::Descomposition;
pub use element::Element;

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
