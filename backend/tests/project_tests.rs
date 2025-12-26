use backend::models::{
    project::{Project, NewProject, ProjectParams},
};
use sqlx::PgPool;
use uuid::Uuid;

#[path = "common.rs"]
mod common;

async fn setup() -> PgPool {
    let _ = &common::TRACING;

    common::setup_pool().await
}

#[tokio::test]
async fn test_create_project() {
    let pool = setup().await;
    let code = format!("P-TEST-{}", Uuid::new_v4());
    let new_project = NewProject {
        code: code.clone(),
        title: Some("Test Project".to_string()),
    };
    let project = Project::create(&pool, new_project).await.unwrap();
    assert_eq!(project.code, code);
    assert_eq!(project.title, "Test Project");
}

#[tokio::test]
async fn test_read_project() {
    let pool = setup().await;
    let code = format!("P-TEST-{}", Uuid::new_v4());
    let new_project = NewProject {
        code: code.clone(),
        title: Some("Test Project".to_string()),
    };
    let project = Project::create(&pool, new_project).await.unwrap();
    let read_project = Project::read_by_id(&pool, project.id).await.unwrap().unwrap();
    assert_eq!(read_project.id, project.id);
    assert_eq!(read_project.code, code);
    assert_eq!(read_project.title, "Test Project");
}

#[tokio::test]
async fn test_update_project() {
    let pool = setup().await;
    let code = format!("P-TEST-{}", Uuid::new_v4());
    let new_project = NewProject {
        code: code.clone(),
        title: Some("Test Project".to_string()),
    };
    let mut project = Project::create(&pool, new_project).await.unwrap();
    let updated_title = "Updated Project".to_string();
    project.title = updated_title.clone();
    let updated_project = Project::update(&pool, project).await.unwrap();
    assert_eq!(updated_project.title, updated_title);
}

#[tokio::test]
async fn test_delete_project() {
    let pool = setup().await;
    let code = format!("P-TEST-{}", Uuid::new_v4());
    let new_project = NewProject {
        code: code.clone(),
        title: Some("Test Project".to_string()),
    };
    let project = Project::create(&pool, new_project).await.unwrap();
    let deleted_project = Project::delete(&pool, project.id).await.unwrap();
    assert_eq!(deleted_project.id, project.id);
    let read_project = Project::read_by_id(&pool, project.id).await.unwrap();
    assert!(read_project.is_none());
}

#[tokio::test]
async fn test_list_projects() {
    let pool = setup().await;
    let code1 = format!("P-TEST-{}", Uuid::new_v4());
    let new_project1 = NewProject {
        code: code1,
        title: Some("Test Project 1".to_string()),
    };
    Project::create(&pool, new_project1).await.unwrap();

    let code2 = format!("P-TEST-{}", Uuid::new_v4());
    let new_project2 = NewProject {
        code: code2,
        title: Some("Test Project 2".to_string()),
    };
    Project::create(&pool, new_project2).await.unwrap();

    let params = ProjectParams {
        id: None,
        code: None,
        title: None,
        page: None,
        limit: None,
        sort_by: None,
        asc: None,
    };
    let projects = Project::read_paged(&pool, &params).await.unwrap();
    assert!(projects.len() >= 2);
}
