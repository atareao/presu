pub mod budget;
mod data;
pub mod descomposition;
pub mod element;
mod filterable;
pub mod measurement;
mod paginable;
pub mod price;
pub mod project;
mod response;
pub mod role;
pub mod token_claims;
pub mod unit;
pub mod user;
pub mod version;

pub type UtcTimestamp = chrono::DateTime<chrono::Utc>;
pub type Error = Box<dyn std::error::Error>;
pub use filterable::Filterable;
pub use paginable::Paginable;
pub use token_claims::TokenClaims;

pub use budget::Budget;
pub use descomposition::{Descomposition, DescompositionParams, NewDescomposition};

pub use element::{Element, ElementParams, ElementType, NewElement};
pub use measurement::Measurement;
pub use price::{NewPrice, Price, PriceParams};
pub use project::{NewProject, Project, ProjectParams};
pub use role::{NewRole, Role, RoleParams};
pub use unit::{NewUnit, Unit, UnitParams};
pub use user::{NewUser, User, UserParams, UserPass};
pub use version::{NewVersion, Version, VersionParams};

pub use data::Data;
pub use response::{ApiResponse, CustomResponse, EmptyResponse, PagedResponse, Pagination};

use sqlx::postgres::PgPool;

pub struct AppState {
    pub pool: PgPool,
    pub secret: String,
    pub static_dir: String,
}
