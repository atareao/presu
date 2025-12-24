use crate::constants::DEFAULT_LIMIT;
use crate::constants::DEFAULT_PAGE;

pub trait Paginable {
    fn page(&self) -> Option<u32>;
    fn limit(&self) -> Option<u32>;

    // Nuevos métodos que devuelven valores concretos
    fn page_or_default(&self) -> i64 {
        self.page().unwrap_or(DEFAULT_PAGE).into()
    }

    fn limit_or_default(&self) -> i64 {
        self.limit().unwrap_or(DEFAULT_LIMIT).into()
    }

    fn offset(&self) -> i64 {
        (self.page_or_default() - 1) * self.limit_or_default()
    }
}

