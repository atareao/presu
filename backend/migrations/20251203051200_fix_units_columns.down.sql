-- Reverse of 20251203051200_fix_units_columns.up.sql.
ALTER TABLE units ADD CONSTRAINT units_symbol_key UNIQUE (symbol);
ALTER TABLE units ALTER COLUMN symbol TYPE VARCHAR(4);

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'units' AND column_name = 'name'
    ) THEN
        ALTER TABLE units RENAME COLUMN name TO unit;
    END IF;

    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'units' AND column_name = 'description'
    ) THEN
        ALTER TABLE units DROP COLUMN description;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'units' AND column_name = 'params'
    ) THEN
        ALTER TABLE units ADD COLUMN params JSONB NOT NULL DEFAULT '[]'::jsonb;
    END IF;
END $$;
