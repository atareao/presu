-- Prices Table
CREATE TABLE prices (
    id SERIAL PRIMARY KEY,
    version_id INTEGER NOT NULL REFERENCES versions(id),
    code VARCHAR(50) NOT NULL UNIQUE,
    description TEXT NOT NULL,
    base_price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    unit_id INTEGER NOT NULL REFERENCES units(id),
    price_type price_type_enum NOT NULL,
    
    -- Audit Fields
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (NOW() AT TIME ZONE 'UTC'),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (NOW() AT TIME ZONE 'UTC'),
    UNIQUE (version_id, code) 
);

CREATE TRIGGER set_updated_at_prices
BEFORE UPDATE ON prices
FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
