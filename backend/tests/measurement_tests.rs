use backend::models::{
    measurement::{Measurement, NewMeasurement, MeasurementParams},
    element::{Element, NewElement, ElementType},
    budget::{Budget, NewBudget, BudgetStatus},
    project::{Project, NewProject},
    version::{Version, NewVersion},
    price::{Price, NewPrice, PriceType},
    unit::{Unit, NewUnit},
};
use sqlx::{PgPool, types::BigDecimal};
use uuid::Uuid;
use serde_json::json;
use rand::Rng;
use num_traits::cast::FromPrimitive;

#[path = "common.rs"]
mod common;

async fn setup() -> (PgPool, Budget, Version, Element, Price, Unit) {
    let _ = &common::TRACING;
    let pool = common::setup_pool().await;

    // Create a project
    let new_project = NewProject {
        code: format!("P-MEAS-{}", Uuid::new_v4().to_string().chars().take(10).collect::<String>()),
        title: Some("Measurement Test Project".to_string()),
    };
    let project = Project::create(&pool, new_project).await.unwrap();

    // Create a budget
    let new_budget = NewBudget {
        project_id: project.id,
        code: format!("B-MEAS-{}", Uuid::new_v4().to_string().chars().take(10).collect::<String>()),
        version_number: 1,
        name: "Measurement Test Budget".to_string(),
        status: BudgetStatus::Draft,
    };
    let budget = Budget::create(&pool, new_budget).await.unwrap();

    // Create a version
    let new_version = NewVersion {
        name: format!("V-MEAS-{}", Uuid::new_v4().to_string().chars().take(10).collect::<String>()),
    };
    let version = Version::create(&pool, new_version).await.unwrap();

    // Create a unit
    let unit_name = format!("U-MEAS-{}", Uuid::new_v4().to_string().chars().take(3).collect::<String>());
    let unit_symbol = "ud".to_string();
    let new_unit = NewUnit {
        name: unit_name.clone(),
        symbol: unit_symbol,
        description: Some("Test Unit for Measurement".to_string()),
        formula: "a * b".to_string(),
    };
    let unit = Unit::create(&pool, new_unit).await.unwrap();

    // Create a price
    let mut rng = rand::thread_rng();
    let new_price = NewPrice {
        version_id: version.id,
        code: format!("PR-MEAS-{}", Uuid::new_v4().to_string().chars().take(10).collect::<String>()),
        description: "Test Price for Measurement".to_string(),
        base_price: BigDecimal::from_f64(rng.gen_range(100.0..200.0)).unwrap(),
        unit_id: unit.id,
        price_type: PriceType::Base,
    };
    let price = Price::create(&pool, new_price).await.unwrap();

    // Create an element
    let new_element = NewElement {
        budget_id: budget.id,
        parent_id: None,
        version_id: version.id,
        element_type: ElementType::Line,
        code: format!("EL-MEAS-{}", Uuid::new_v4().to_string().chars().take(10).collect::<String>()),
        budget_code: format!("EL-BUD-MEAS-{}", Uuid::new_v4().to_string().chars().take(10).collect::<String>()),
        description: Some("Measurement Test Element".to_string()),
    };
    let element = Element::create(&pool, new_element).await.unwrap();

    (pool, budget, version, element, price, unit)
}

#[tokio::test]
async fn test_create_measurement() {
    let (pool, _budget, _version, element, price, _unit) = setup().await;
    let new_measurement = NewMeasurement {
        element_id: element.id,
        price_id: price.id,
        params_json: json!({"length": 10.0, "width": 2.0}),
        measurement_text: Some("Test measurement 1".to_string()),
        measured_quantity: BigDecimal::from_f64(10.0).unwrap(),
    };
    let measurement = Measurement::create(&pool, new_measurement).await.unwrap();
    assert_eq!(measurement.element_id, element.id);
    assert_eq!(measurement.price_id, price.id);
    assert_eq!(measurement.measured_quantity, BigDecimal::from_f64(10.0).unwrap());
}

#[tokio::test]
async fn test_read_measurement() {
    let (pool, _budget, _version, element, price, _unit) = setup().await;
    let new_measurement = NewMeasurement {
        element_id: element.id,
        price_id: price.id,
        params_json: json!({"length": 10.0, "width": 2.0}),
        measurement_text: Some("Test measurement 2".to_string()),
        measured_quantity: BigDecimal::from_f64(20.0).unwrap(),
    };
    let measurement = Measurement::create(&pool, new_measurement).await.unwrap();
    let read_measurement = Measurement::read_by_id(&pool, measurement.id).await.unwrap().unwrap();
    assert_eq!(read_measurement.id, measurement.id);
    assert_eq!(read_measurement.element_id, element.id);
    assert_eq!(read_measurement.price_id, price.id);
    assert_eq!(read_measurement.measured_quantity, BigDecimal::from_f64(20.0).unwrap());
}

#[tokio::test]
async fn test_update_measurement() {
    let (pool, _budget, _version, element, price, _unit) = setup().await;
    let new_measurement = NewMeasurement {
        element_id: element.id,
        price_id: price.id,
        params_json: json!({"length": 10.0, "width": 2.0}),
        measurement_text: Some("Test measurement 3".to_string()),
        measured_quantity: BigDecimal::from_f64(30.0).unwrap(),
    };
    let mut measurement = Measurement::create(&pool, new_measurement).await.unwrap();
    measurement.measured_quantity = BigDecimal::from_f64(35.0).unwrap();
    let updated_measurement = Measurement::update(&pool, measurement).await.unwrap();
    assert_eq!(updated_measurement.measured_quantity, BigDecimal::from_f64(35.0).unwrap());
}

#[tokio::test]
async fn test_delete_measurement() {
    let (pool, _budget, _version, element, price, _unit) = setup().await;
    let new_measurement = NewMeasurement {
        element_id: element.id,
        price_id: price.id,
        params_json: json!({"length": 10.0, "width": 2.0}),
        measurement_text: Some("Test measurement 4".to_string()),
        measured_quantity: BigDecimal::from_f64(40.0).unwrap(),
    };
    let measurement = Measurement::create(&pool, new_measurement).await.unwrap();
    let deleted_measurement = Measurement::delete(&pool, measurement.id).await.unwrap();
    assert_eq!(deleted_measurement.id, measurement.id);
    let read_measurement = Measurement::read_by_id(&pool, measurement.id).await.unwrap();
    assert!(read_measurement.is_none());
}

#[tokio::test]
async fn test_list_measurements() {
    let (pool, _budget, _version, element, price, _unit) = setup().await;
    let new_measurement1 = NewMeasurement {
        element_id: element.id,
        price_id: price.id,
        params_json: json!({"length": 10.0, "width": 2.0}),
        measurement_text: Some("Test measurement 5".to_string()),
        measured_quantity: BigDecimal::from_f64(50.0).unwrap(),
    };
    Measurement::create(&pool, new_measurement1).await.unwrap();

    let new_measurement2 = NewMeasurement {
        element_id: element.id,
        price_id: price.id,
        params_json: json!({"length": 5.0, "width": 5.0}),
        measurement_text: Some("Test measurement 6".to_string()),
        measured_quantity: BigDecimal::from_f64(60.0).unwrap(),
    };
    Measurement::create(&pool, new_measurement2).await.unwrap();

    let params = MeasurementParams {
        id: None,
        measurement_text: None,
        measured_quantity: None,
        page: None,
        limit: None,
        sort_by: None,
        asc: None,
    };
    let measurements = Measurement::read_paged(&pool, &params).await.unwrap();
    assert!(measurements.len() >= 2);
}
