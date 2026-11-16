BEGIN;

-- Speeds up scheduled/manual cleanup of expired rate-limit buckets.
CREATE INDEX IF NOT EXISTS rate_limit_buckets_reset_at_idx
  ON public.rate_limit_buckets (reset_at);

-- Prevent invalid negative counters from entering the limiter table.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'rate_limit_buckets_count_nonnegative_chk'
      AND conrelid = 'public.rate_limit_buckets'::regclass
  ) THEN
    ALTER TABLE public.rate_limit_buckets
      ADD CONSTRAINT rate_limit_buckets_count_nonnegative_chk CHECK (count >= 0);
  END IF;
END $$;

COMMIT;

-- Optional maintenance query; run periodically from a trusted server/cron job:
-- DELETE FROM public.rate_limit_buckets WHERE reset_at < NOW() - INTERVAL '2 days';
