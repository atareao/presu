use serde::{Serialize, Serializer};
use serde_json::Value;

#[derive(Debug, Clone)]
pub enum Data {
    None,
    Some(Value),
}

impl Serialize for Data {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: Serializer,
    {
        match self {
            Data::None => serializer.serialize_none(),
            Data::Some(value) => serializer.serialize_some(value),
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::json;

    #[test]
    fn test_serialize_data_none() {
        let data = Data::None;
        let serialized = serde_json::to_string(&data).unwrap();
        assert_eq!(serialized, "null");
    }

    #[test]
    fn test_serialize_data_some() {
        let value = json!({ "key": "value" });
        let data = Data::Some(value.clone());
        let serialized = serde_json::to_string(&data).unwrap();
        assert_eq!(serialized, "{\"key\":\"value\"}");
    }
}

