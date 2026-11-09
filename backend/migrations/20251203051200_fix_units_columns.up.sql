-- Align the `units` table with the application contract.
-- Migration 20251201194335 created the table with the columns
-- `unit` / `params` and a UNIQUE, 4-char `symbol`, but the model
-- (`src/models/unit.rs`), the HTTP API and the frontend all use
-- `name` / `symbol` / `description` / `formula`, and units may share a symbol.
-- Conditional so it is a no-op on databases whose schema is already correct.
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'units' AND column_name = 'unit'
    ) THEN
        ALTER TABLE units RENAME COLUMN unit TO name;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'units' AND column_name = 'description'
    ) THEN
        ALTER TABLE units ADD COLUMN description VARCHAR(50);
    END IF;

    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'units' AND column_name = 'params'
    ) THEN
        ALTER TABLE units DROP COLUMN params;
    END IF;
END $$;

-- A symbol is a short label that is not required to be globally unique.
ALTER TABLE units ALTER COLUMN symbol TYPE VARCHAR(30);
ALTER TABLE units DROP CONSTRAINT IF EXISTS units_symbol_key;
