-- Units of Measure Table
CREATE TABLE units (
    id SERIAL PRIMARY KEY,
    name VARCHAR(10) NOT NULL UNIQUE,
    symbol VARCHAR(4) NOT NULL,
    description VARCHAR(50),
    formula TEXT NOT NULL, 
    -- Audit Fields
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (NOW() AT TIME ZONE 'UTC'),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (NOW() AT TIME ZONE 'UTC')
);

CREATE TRIGGER set_updated_at_units
BEFORE UPDATE ON units
FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
