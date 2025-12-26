pub mod descomposition;
mod element;
mod measurement;
pub mod price;
pub mod project;
pub mod role;
pub mod unit;
pub mod user;
pub mod version;
pub mod budget;
mod data;
mod response;
mod filterable;
mod paginable;

pub type UtcTimestamp = chrono::DateTime<chrono::Utc>;
pub type Error = Box<dyn std::error::Error>;
pub use filterable::Filterable;
pub use paginable::Paginable;

pub use budget::Budget;
pub use descomposition::{Descomposition, NewDescomposition, DescompositionParams};
pub use element::Element;
pub use measurement::Measurement;
pub use price::{Price, NewPrice, PriceParams};
pub use project::{Project, NewProject, ProjectParams};
pub use role::{Role, NewRole, RoleParams};
pub use unit::{Unit, NewUnit, UnitParams};
pub use user::{User, NewUser, UserParams};
pub use version::{Version, NewVersion, VersionParams};

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
