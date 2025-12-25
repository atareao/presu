-- Measurement Lines Table
CREATE TABLE measurements (
    id SERIAL PRIMARY KEY,
    element_id INTEGER NOT NULL REFERENCES elements(id), 
    price_id INTEGER NOT NULL REFERENCES prices(id), 
    params_json JSONB NOT NULL, 
    measurement_text TEXT,
    measured_quantity NUMERIC(10, 4) NOT NULL,
    -- Audit Fields
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (NOW() AT TIME ZONE 'UTC'),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (NOW() AT TIME ZONE 'UTC')
);

CREATE TRIGGER set_updated_at_measurements
BEFORE UPDATE ON measurements
FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
