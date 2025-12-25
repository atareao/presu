-- Tabla de Elementos de Presupuesto (elements)
CREATE TABLE elements (
    id SERIAL PRIMARY KEY,
    budget_id INTEGER NOT NULL REFERENCES budgets(id),
    parent_id INTEGER REFERENCES elements(id), 
    version_id INTEGER NOT NULL REFERENCES versions(id), 
    element_type element_type_enum NOT NULL, 
    code VARCHAR(50) NOT NULL UNIQUE,
    budget_code VARCHAR(50) NOT NULL,
    description TEXT,
    -- Audit Fields
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (NOW() AT TIME ZONE 'UTC'),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (NOW() AT TIME ZONE 'UTC'),
    UNIQUE (budget_id, budget_code)
);

CREATE TRIGGER set_updated_at_elements
BEFORE UPDATE ON elements
FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
