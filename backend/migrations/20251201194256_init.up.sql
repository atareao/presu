CREATE TYPE price_type_enum AS ENUM ('base', 'decomposed');
CREATE TYPE element_type_enum AS ENUM ('chapter', 'line');
CREATE TYPE calculation_mode_enum AS ENUM ('fixed', 'formula');

-- Function to automatically update 'updated_at' to UTC timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW() AT TIME ZONE 'UTC';
   RETURN NEW;
END;
$$ language 'plpgsql';
-- Add up migration script here
