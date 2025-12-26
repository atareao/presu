use backend::models::{
    element::{Element, NewElement, ElementParams, ElementType},
    project::{Project, NewProject},
    budget::{Budget, NewBudget},
    version::{Version, NewVersion},
};
use sqlx::PgPool;
use uuid::Uuid;

#[path = "common.rs"]
mod common;

async fn setup() -> (PgPool, Budget, Version) {
    let _ = &common::TRACING;
    let pool = common::setup_pool().await;

    // Create a project
    let new_project = NewProject {
        code: format!("P-ELEM-{}", Uuid::new_v4().to_string().chars().take(10).collect::<String>()),
        title: Some("Element Test Project".to_string()),
    };
    let project = Project::create(&pool, new_project).await.unwrap();

    //Create a budget
    let new_budget = NewBudget {
        project_id: project.id,
        code: format!("B-ELEM-{}", Uuid::new_v4().to_string().chars().take(10).collect::<String>()),
        version_number: 1,
        name: "Element Test Budget".to_string(),
        status: backend::models::budget::BudgetStatus::Draft,
    };
    let budget = Budget::create(&pool, new_budget).await.unwrap();


    // Create a version
    let new_version = NewVersion {
        name: format!("V-ELEM-{}", Uuid::new_v4().to_string().chars().take(10).collect::<String>()),
    };
    let version = Version::create(&pool, new_version).await.unwrap();

    (pool, budget, version)
}

#[tokio::test]
async fn test_create_element() {
    let (pool, budget, version) = setup().await;
    let code = Uuid::new_v4().to_string().chars().take(8).collect::<String>();
    let budget_code = Uuid::new_v4().to_string().chars().take(8).collect::<String>();
    let new_element = NewElement {
        budget_id: budget.id,
        parent_id: None,
        version_id: version.id,
        element_type: ElementType::Chapter,
        code: code.clone(),
        budget_code: budget_code.clone(),
        description: Some("Test Chapter Element".to_string()),
    };
    let element = Element::create(&pool, new_element).await.unwrap();
    assert_eq!(element.budget_id, budget.id);
    assert_eq!(element.parent_id, None);
    assert_eq!(element.version_id, version.id);
    assert_eq!(element.element_type, ElementType::Chapter);
    assert_eq!(element.code, code);
    assert_eq!(element.budget_code, budget_code);
    assert_eq!(element.description, Some("Test Chapter Element".to_string()));
}

#[tokio::test]
async fn test_read_element() {
    let (pool, budget, version) = setup().await;
    let code = Uuid::new_v4().to_string().chars().take(8).collect::<String>();
    let budget_code = Uuid::new_v4().to_string().chars().take(8).collect::<String>();
    let new_element = NewElement {
        budget_id: budget.id,
        parent_id: None,
        version_id: version.id,
        element_type: ElementType::Line,
        budget_code: budget_code.clone(),
        code: code.clone(),
        description: Some("Test Line Element".to_string()),
    };
    let element = Element::create(&pool, new_element).await.unwrap();
    let read_element = Element::read_by_id(&pool, element.id).await.unwrap().unwrap();
    assert_eq!(read_element.id, element.id);
    assert_eq!(read_element.budget_id, budget.id);
    assert_eq!(read_element.parent_id, None);
    assert_eq!(read_element.version_id, version.id);
    assert_eq!(read_element.element_type, ElementType::Line);
    assert_eq!(read_element.budget_code, budget_code);
    assert_eq!(read_element.code, code);
    assert_eq!(read_element.description, Some("Test Line Element".to_string()));
}

#[tokio::test]
async fn test_update_element() {
    let (pool, budget, version) = setup().await;
    let code = Uuid::new_v4().to_string().chars().take(8).collect::<String>();
    let budget_code = Uuid::new_v4().to_string().chars().take(8).collect::<String>();
    let new_element = NewElement {
        budget_id: budget.id,
        parent_id: None,
        version_id: version.id,
        element_type: ElementType::Chapter,
        code: code.clone(),
        budget_code: budget_code.clone(),
        description: Some("Test Chapter Element".to_string()),
    };
    let mut element = Element::create(&pool, new_element).await.unwrap();
    let updated_description = Some("Updated Chapter Element".to_string());
    element.description = updated_description.clone();
    let updated_element = Element::update(&pool, element).await.unwrap();
    assert_eq!(updated_element.description, updated_description);
}

#[tokio::test]
async fn test_delete_element() {
    let (pool, budget, version) = setup().await;
    let code = Uuid::new_v4().to_string().chars().take(8).collect::<String>();
    let budget_code = Uuid::new_v4().to_string().chars().take(8).collect::<String>();
    let new_element = NewElement {
        budget_id: budget.id,
        parent_id: None,
        version_id: version.id,
        element_type: ElementType::Line,
        code: code.clone(),
        budget_code: budget_code.clone(),
        description: Some("Test Line Element".to_string()),
    };
    let element = Element::create(&pool, new_element).await.unwrap();
    let deleted_element = Element::delete(&pool, element.id).await.unwrap();
    assert_eq!(deleted_element.id, element.id);
    let read_element = Element::read_by_id(&pool, element.id).await.unwrap();
    assert!(read_element.is_none());
}

#[tokio::test]
async fn test_list_elements() {
    let (pool, budget, version) = setup().await;
    let code = Uuid::new_v4().to_string().chars().take(8).collect::<String>();
    let budget_code = Uuid::new_v4().to_string().chars().take(8).collect::<String>();
    let new_element1 = NewElement {
        budget_id: budget.id,
        parent_id: None,
        version_id: version.id,
        element_type: ElementType::Chapter,
        code: code.clone(),
        budget_code: budget_code.clone(),
        description: Some("Test Chapter 1".to_string()),
    };
    Element::create(&pool, new_element1).await.unwrap();

    let code = Uuid::new_v4().to_string().chars().take(8).collect::<String>();
    let budget_code = Uuid::new_v4().to_string().chars().take(8).collect::<String>();
    let new_element2 = NewElement {
        budget_id: budget.id,
        parent_id: None,
        version_id: version.id,
        element_type: ElementType::Line,
        code: code.clone(),
        budget_code: budget_code.clone(),
        description: Some("Test Line 1".to_string()),
    };
    Element::create(&pool, new_element2).await.unwrap();

    let params = ElementParams {
        id: None,
        parent_id: None,
        version_id: Some(version.id),
        element_type: None,
        code: None,
        budget_code: None,
        description: None,
        page: None,
        limit: None,
        sort_by: None,
        asc: None,
    };
    let elements = Element::read_paged(&pool, &params).await.unwrap();
    assert!(elements.len() >= 2);
}
