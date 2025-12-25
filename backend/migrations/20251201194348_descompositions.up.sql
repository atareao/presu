-- Decompositions Table
CREATE TABLE decompositions (
    id SERIAL PRIMARY KEY,
    parent_price_id INTEGER NOT NULL REFERENCES prices(id), 
    component_price_id INTEGER NOT NULL REFERENCES prices(id), 
    calculation_mode calculation_mode_enum NOT NULL,
    fixed_quantity NUMERIC(10, 4),
    params_json JSONB, 
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (NOW() AT TIME ZONE 'UTC'),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (NOW() AT TIME ZONE 'UTC'),
    UNIQUE (parent_price_id, component_price_id),
    CHECK (
        (calculation_mode = 'fixed' AND fixed_quantity IS NOT NULL AND params_json IS NULL) OR
        (calculation_mode = 'formula' AND fixed_quantity IS NULL AND params_json IS NOT NULL)
    )
);

CREATE TRIGGER set_updated_at_decompositions
BEFORE UPDATE ON decompositions
FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
