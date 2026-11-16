ALTER TABLE IF EXISTS invitations
  ADD COLUMN IF NOT EXISTS metadata jsonb NOT NULL DEFAULT '{}'::jsonb;

CREATE TABLE IF NOT EXISTS dhikr_counters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scope_key text NOT NULL DEFAULT 'global',
  invitation_id uuid REFERENCES invitations(id) ON DELETE CASCADE,
  dhikr_key text NOT NULL,
  total_count integer NOT NULL DEFAULT 0,
  participants_count integer NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS dhikr_counters_scope_key_idx
  ON dhikr_counters (scope_key, dhikr_key);

CREATE INDEX IF NOT EXISTS dhikr_counters_invitation_idx
  ON dhikr_counters (invitation_id);

CREATE TABLE IF NOT EXISTS dhikr_counter_contributors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  counter_id uuid NOT NULL REFERENCES dhikr_counters(id) ON DELETE CASCADE,
  contributor_hash text NOT NULL,
  contribution_count integer NOT NULL DEFAULT 0,
  last_contributed_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS dhikr_contributors_unique_idx
  ON dhikr_counter_contributors (counter_id, contributor_hash);

CREATE INDEX IF NOT EXISTS dhikr_contributors_hash_idx
  ON dhikr_counter_contributors (contributor_hash);

CREATE TABLE IF NOT EXISTS quran_readings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  invitation_id uuid REFERENCES invitations(id) ON DELETE CASCADE,
  contributor_hash text,
  surah_number integer NOT NULL,
  surah_name text,
  completed_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS quran_readings_invitation_idx
  ON quran_readings (invitation_id, completed_at);

CREATE INDEX IF NOT EXISTS quran_readings_user_idx
  ON quran_readings (user_id);

CREATE INDEX IF NOT EXISTS quran_readings_surah_idx
  ON quran_readings (surah_number);

ALTER TABLE dhikr_counters ENABLE ROW LEVEL SECURITY;
ALTER TABLE dhikr_counter_contributors ENABLE ROW LEVEL SECURITY;
ALTER TABLE quran_readings ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'dhikr_counters_non_negative' AND conrelid = 'dhikr_counters'::regclass
  ) THEN
    ALTER TABLE dhikr_counters
      ADD CONSTRAINT dhikr_counters_non_negative
      CHECK (total_count >= 0 AND participants_count >= 0);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'dhikr_contributors_non_negative' AND conrelid = 'dhikr_counter_contributors'::regclass
  ) THEN
    ALTER TABLE dhikr_counter_contributors
      ADD CONSTRAINT dhikr_contributors_non_negative
      CHECK (contribution_count >= 0);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'dhikr_counters' AND policyname = 'dhikr_counters_public_read'
  ) THEN
    CREATE POLICY dhikr_counters_public_read ON dhikr_counters FOR SELECT USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'quran_readings' AND policyname = 'quran_readings_public_aggregate_read'
  ) THEN
    CREATE POLICY quran_readings_public_aggregate_read ON quran_readings FOR SELECT USING (true);
  END IF;

  IF EXISTS (
    SELECT 1
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'auth' AND p.proname = 'uid'
  ) THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies
      WHERE tablename = 'dhikr_counter_contributors' AND policyname = 'dhikr_contributors_owner_read'
    ) THEN
      CREATE POLICY dhikr_contributors_owner_read ON dhikr_counter_contributors
        FOR SELECT USING (auth.uid() IS NOT NULL);
    END IF;
  END IF;

  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
    REVOKE ALL ON dhikr_counter_contributors FROM anon;
  END IF;

  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
    REVOKE ALL ON dhikr_counter_contributors FROM authenticated;
    REVOKE INSERT, UPDATE, DELETE ON dhikr_counters FROM authenticated;
    REVOKE INSERT, UPDATE, DELETE ON quran_readings FROM authenticated;
  END IF;
END $$;
