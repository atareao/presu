use backend::models::token_claims::TokenClaims;

#[test]
fn test_token_claims_serde() {
    let token_claims = TokenClaims {
        sub: "user123".to_string(),
        role: "admin".to_string(),
        iat: 1672531200,
        exp: 1672617600,
    };

    // Serialize
    let serialized = serde_json::to_string(&token_claims).unwrap();
    assert!(serialized.contains(r#""sub":"user123""#));
    assert!(serialized.contains(r#""role":"admin""#));
    assert!(serialized.contains(r#""iat":1672531200"#));
    assert!(serialized.contains(r#""exp":1672617600"#));

    // Deserialize
    let deserialized: TokenClaims = serde_json::from_str(&serialized).unwrap();
    assert_eq!(deserialized.sub, "user123");
    assert_eq!(deserialized.role, "admin");
    assert_eq!(deserialized.iat, 1672531200);
    assert_eq!(deserialized.exp, 1672617600);
}
