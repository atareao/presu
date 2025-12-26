use backend::models::{
    version::{Version, NewVersion, VersionParams},
};
use sqlx::PgPool;
use uuid::Uuid;

#[path = "common.rs"]
mod common;

async fn setup() -> PgPool {
    let _ = &common::TRACING;
    let pool = common::setup_pool().await;
    pool
}

#[tokio::test]
async fn test_create_version() {
    let pool = setup().await;
    let name = format!("V-TEST-{}", Uuid::new_v4());
    let new_version = NewVersion {
        name: name.clone(),
    };
    let version = Version::create(&pool, new_version).await.unwrap();
    assert_eq!(version.name, name);
}

#[tokio::test]
async fn test_read_version() {
    let pool = setup().await;
    let name = format!("V-TEST-{}", Uuid::new_v4());
    let new_version = NewVersion {
        name: name.clone(),
    };
    let version = Version::create(&pool, new_version).await.unwrap();
    let read_version = Version::read_by_id(&pool, version.id).await.unwrap().unwrap();
    assert_eq!(read_version.id, version.id);
    assert_eq!(read_version.name, name);
}

#[tokio::test]
async fn test_update_version() {
    let pool = setup().await;
    let name = format!("V-TEST-{}", Uuid::new_v4());
    let new_version = NewVersion {
        name: name.clone(),
    };
    let mut version = Version::create(&pool, new_version).await.unwrap();
    let updated_name = format!("V-TEST-UPDATED-{}", Uuid::new_v4());
    version.name = updated_name.clone();
    let updated_version = Version::update(&pool, version).await.unwrap();
    assert_eq!(updated_version.name, updated_name);
}

#[tokio::test]
async fn test_delete_version() {
    let pool = setup().await;
    let name = format!("V-TEST-{}", Uuid::new_v4());
    let new_version = NewVersion {
        name: name.clone(),
    };
    let version = Version::create(&pool, new_version).await.unwrap();
    let deleted_version = Version::delete(&pool, version.id).await.unwrap();
    assert_eq!(deleted_version.id, version.id);
    let read_version = Version::read_by_id(&pool, version.id).await.unwrap();
    assert!(read_version.is_none());
}

#[tokio::test]
async fn test_list_versions() {
    let pool = setup().await;
    let name1 = format!("V-TEST-{}", Uuid::new_v4());
    let new_version1 = NewVersion {
        name: name1,
    };
    Version::create(&pool, new_version1).await.unwrap();

    let name2 = format!("V-TEST-{}", Uuid::new_v4());
    let new_version2 = NewVersion {
        name: name2,
    };
    Version::create(&pool, new_version2).await.unwrap();

    let params = VersionParams {
        id: None,
        name: None,
        page: None,
        limit: None,
        sort_by: None,
        asc: None,
    };
    let versions = Version::read_paged(&pool, &params).await.unwrap();
    assert!(versions.len() >= 2);
}
