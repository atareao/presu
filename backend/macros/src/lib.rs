use proc_macro::TokenStream;
use quote::quote;
use syn::{parse_macro_input, DeriveInput};

#[proc_macro_derive(Paginable)]
pub fn paginable_derive(input: TokenStream) -> TokenStream {
    let input = parse_macro_input!(input as DeriveInput);
    let name = &input.ident;

    let expanded = quote! {
        impl #name {
            // Devuelve el límite proporcionado o el valor por defecto
            pub fn limit_sql(&self, default: u32) -> i64 {
                self.limit.unwrap_or(default) as i64
            }

            // Calcula el offset usando los valores proporcionados o los por defecto
            pub fn offset_sql(&self, default_page: u32, default_limit: u32) -> i64 {
                let p = self.page.unwrap_or(default_page);
                let l = self.limit.unwrap_or(default_limit);
                if p > 0 { ((p - 1) * l) as i64 } else { 0 }
            }
            
            // Determina si se debe aplicar paginación (si al menos uno está presente)
            pub fn is_paged(&self) -> bool {
                self.page.is_some() || self.limit.is_some()
            }
        }

        impl Paginable for #name {
            fn page(&self) -> Option<u32> { self.page }
            fn limit(&self) -> Option<u32> { self.limit }
        }
    };
    TokenStream::from(expanded)
}

