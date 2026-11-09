//! Firma de tokens JWT con HS256.
//!
//! El backend solo **emite** tokens (no los verifica), así que no necesita los
//! algoritmos asimétricos de `jsonwebtoken`: con la feature `rust_crypto` se
//! arrastraban RSA, P-256/P-384 y ed25519, que aportaban una decena de crates
//! sin uso y varias vulnerabilidades (RUSTSEC-2023-0071 en `rsa` y
//! RUSTSEC-2026-0387 en `crypto-bigint`). Aquí solo se implementa HMAC-SHA256,
//! que es el algoritmo que realmente usamos.

use base64::{Engine, engine::general_purpose::URL_SAFE_NO_PAD};
use hmac::{Hmac, Mac, digest::KeyInit};
use serde::Serialize;
use sha2::Sha256;

type HmacSha256 = Hmac<Sha256>;

/// Cabecera fija `{"alg":"HS256","typ":"JWT"}` codificada en base64url sin relleno.
const HEADER: &str = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9";

/// Error al firmar: el payload no se pudo serializar.
#[derive(Debug)]
pub struct Error(serde_json::Error);

impl std::fmt::Display for Error {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "no se pudo serializar el payload: {}", self.0)
    }
}

impl std::error::Error for Error {
    fn source(&self) -> Option<&(dyn std::error::Error + 'static)> {
        Some(&self.0)
    }
}

/// Firma `claims` como JWT HS256 y devuelve el token `header.payload.signature`.
pub fn encode<T: Serialize>(claims: &T, secret: &[u8]) -> Result<String, Error> {
    let payload = URL_SAFE_NO_PAD.encode(serde_json::to_vec(claims).map_err(Error)?);
    let signing_input = format!("{HEADER}.{payload}");

    // HMAC acepta claves de cualquier longitud; el `expect` documenta que el
    // único fallo posible (longitud inválida) no puede darse.
    let mut mac =
        HmacSha256::new_from_slice(secret).expect("HMAC-SHA256 admite claves de longitud variable");
    mac.update(signing_input.as_bytes());
    let signature = URL_SAFE_NO_PAD.encode(mac.finalize().into_bytes());

    Ok(format!("{signing_input}.{signature}"))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[derive(Serialize)]
    struct Claims {
        sub: String,
        exp: usize,
    }

    fn claims() -> Claims {
        Claims {
            sub: "user@example.com".to_string(),
            exp: 1_700_000_000,
        }
    }

    #[test]
    fn el_token_tiene_tres_segmentos() {
        let token = encode(&claims(), b"secret").unwrap();
        assert_eq!(token.split('.').count(), 3);
    }

    #[test]
    fn la_cabecera_es_hs256_sin_padding() {
        let token = encode(&claims(), b"secret").unwrap();
        let header = token.split('.').next().unwrap();
        assert_eq!(header, HEADER);
        assert_eq!(
            URL_SAFE_NO_PAD.decode(header).unwrap(),
            br#"{"alg":"HS256","typ":"JWT"}"#
        );
    }

    #[test]
    fn el_payload_es_el_json_de_los_claims() {
        let token = encode(&claims(), b"secret").unwrap();
        let payload = token.split('.').nth(1).unwrap();
        let decoded = URL_SAFE_NO_PAD.decode(payload).unwrap();
        let json: serde_json::Value = serde_json::from_slice(&decoded).unwrap();
        assert_eq!(json["sub"], "user@example.com");
        assert_eq!(json["exp"], 1_700_000_000);
    }

    #[test]
    fn la_firma_es_hmac_sha256_de_cabecera_y_payload() {
        let token = encode(&claims(), b"secret").unwrap();
        let (signing_input, signature) = token.rsplit_once('.').unwrap();

        let mut mac = HmacSha256::new_from_slice(b"secret").unwrap();
        mac.update(signing_input.as_bytes());
        let expected = URL_SAFE_NO_PAD.encode(mac.finalize().into_bytes());

        assert_eq!(signature, expected);
    }

    #[test]
    fn secretos_distintos_firman_distinto() {
        let a = encode(&claims(), b"secret-a").unwrap();
        let b = encode(&claims(), b"secret-b").unwrap();
        assert_ne!(a.rsplit_once('.').unwrap().1, b.rsplit_once('.').unwrap().1);
    }
}
