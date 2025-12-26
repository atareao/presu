use backend::models::{
    budget::{Budget, NewBudget, BudgetParams, BudgetStatus},
    project::{Project, NewProject},
};
use sqlx::PgPool;
use uuid::Uuid;
use rand::Rng;

#[path = "common.rs"]
mod common;

async fn setup() -> (PgPool, Project) {
    let _ = &common::TRACING;

    let pool = common::setup_pool().await;

    let new_project = NewProject {
        code: format!("P-TEST-{}", Uuid::new_v4()),
        title: Some("Test Project".to_string()),
    };
    let project = Project::create(&pool, new_project).await.unwrap();
    (pool, project)
}

#[tokio::test]
async fn test_create_budget() {
    let (pool, project) = setup().await;
    let mut rng = rand::thread_rng();
    let new_budget = NewBudget {
        project_id: project.id,
        code: format!("P-001-{}", Uuid::new_v4()),
        version_number: rng.gen_range(1..100000),
        name: "Budget 1".to_string(),
        status: BudgetStatus::Draft,
    };
    let budget = Budget::create(&pool, new_budget).await.unwrap();
    assert_eq!(budget.project_id, project.id);
    assert!(budget.code.starts_with("P-001-"));
    assert_eq!(budget.name, "Budget 1");
    assert_eq!(budget.status, BudgetStatus::Draft);
}

#[tokio::test]
async fn test_read_budget() {
    let (pool, project) = setup().await;
    let mut rng = rand::thread_rng();
    let new_budget = NewBudget {
        project_id: project.id,
        code: format!("P-002-{}", Uuid::new_v4()),
        version_number: rng.gen_range(1..100000),
        name: "Budget 2".to_string(),
        status: BudgetStatus::Draft,
    };
    let budget = Budget::create(&pool, new_budget).await.unwrap();
    let read_budget = Budget::read_by_id(&pool, budget.id).await.unwrap().unwrap();
    assert_eq!(read_budget.id, budget.id);
    assert_eq!(read_budget.project_id, project.id);
    assert!(read_budget.code.starts_with("P-002-"));
    assert_eq!(read_budget.name, "Budget 2");
    assert_eq!(read_budget.status, BudgetStatus::Draft);
}

#[tokio::test]
async fn test_update_budget() {
    let (pool, project) = setup().await;
    let mut rng = rand::thread_rng();
    let new_budget = NewBudget {
        project_id: project.id,
        code: format!("P-003-{}", Uuid::new_v4()),
        version_number: rng.gen_range(1..100000),
        name: "Budget 3".to_string(),
        status: BudgetStatus::Draft,
    };
    let mut budget = Budget::create(&pool, new_budget).await.unwrap();
    budget.name = "Budget 3 updated".to_string();
    let updated_budget = Budget::update(&pool, budget).await.unwrap();
    assert_eq!(updated_budget.name, "Budget 3 updated");
}

#[tokio::test]
async fn test_delete_budget() {
    let (pool, project) = setup().await;
    let mut rng = rand::thread_rng();
    let new_budget = NewBudget {
        project_id: project.id,
        code: format!("P-004-{}", Uuid::new_v4()),
        version_number: rng.gen_range(1..100000),
        name: "Budget 4".to_string(),
        status: BudgetStatus::Draft,
    };
    let budget = Budget::create(&pool, new_budget).await.unwrap();
    let deleted_budget = Budget::delete(&pool, budget.id).await.unwrap();
    assert_eq!(deleted_budget.id, budget.id);
    let read_budget = Budget::read_by_id(&pool, budget.id).await.unwrap();
    assert!(read_budget.is_none());
}

#[tokio::test]
async fn test_list_budgets() {
    let (pool, project) = setup().await;
    let mut rng = rand::thread_rng();
    let new_budget = NewBudget {
        project_id: project.id,
        code: format!("P-005-{}", Uuid::new_v4()),
        version_number: rng.gen_range(1..100000),
        name: "Budget 5".to_string(),
        status: BudgetStatus::Draft,
    };
    Budget::create(&pool, new_budget).await.unwrap();
    let new_budget = NewBudget {
        project_id: project.id,
        code: format!("P-006-{}", Uuid::new_v4()),
        version_number: rng.gen_range(1..100000),
        name: "Budget 6".to_string(),
        status: BudgetStatus::Draft,
    };
    Budget::create(&pool, new_budget).await.unwrap();
    let params = BudgetParams {
        id: None,
        project_id: Some(project.id),
        code: None,
        version_number: None,
        name: None,
        status: None,
        page: None,
        limit: None,
        sort_by: None,
        asc: None,
    };
    let budgets = Budget::read_paged(&pool, &params).await.unwrap();
    assert!(budgets.len() >= 2);
}
