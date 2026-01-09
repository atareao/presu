-- Units of Measure Table
CREATE TABLE units (
    id SERIAL PRIMARY KEY,
    unit VARCHAR(30) NOT NULL UNIQUE,  -- Metro | Metro cuadrado
    symbol VARCHAR(4) NOT NULL UNIQUE, -- m     | m2
    formula TEXT NOT NULL,             -- a     | a * b
    params JSONB NOT NULL,             -- ["a"] | ["a", "b"]
    -- Audit Fields
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (NOW() AT TIME ZONE 'UTC'),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (NOW() AT TIME ZONE 'UTC')
);

CREATE TRIGGER set_updated_at_units
BEFORE UPDATE ON units
FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
