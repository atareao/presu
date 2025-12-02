CREATE TABLE budgets (
    id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL REFERENCES projects(id), 
    version_number INTEGER NOT NULL,    -- 1, 2, 3, etc
    name VARCHAR(255) NOT NULL,         -- "Modificación del cliente"
    status budget_status_enum NOT NULL, -- "draft", "submitted", "approved", etc
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (NOW() AT TIME ZONE 'UTC'),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (NOW() AT TIME ZONE 'UTC'),
    created_by INTEGER NOT NULL REFERENCES users(id),
    updated_by INTEGER NOT NULL REFERENCES users(id),
    UNIQUE (project_id, version_number)
);

CREATE TRIGGER set_updated_at_budget_versions
BEFORE UPDATE ON budget_versions
FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
