BEGIN;

DO $$ BEGIN
  ALTER TABLE profiles ADD CONSTRAINT profiles_role_valid_check
    CHECK (role IN ('user', 'support', 'moderator', 'admin', 'super_admin', 'owner'));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE profiles ADD CONSTRAINT profiles_membership_plan_valid_check
    CHECK (membership_plan IN ('FREE', 'PLUS', 'PRO', 'VIP'));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE profiles ADD CONSTRAINT profiles_membership_dates_check
    CHECK (membership_expires_at IS NULL OR membership_starts_at IS NULL OR membership_expires_at > membership_starts_at);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE membership_plans ADD CONSTRAINT membership_plans_price_nonnegative_check
    CHECK (price_egp >= 0 AND price_egp <= 100000);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE subscriptions ADD CONSTRAINT subscriptions_status_valid_check
    CHECK (status IN ('pending', 'active', 'expired', 'cancelled', 'rejected'));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE subscriptions ADD CONSTRAINT subscriptions_amount_nonnegative_check
    CHECK (amount_egp >= 0);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE subscriptions ADD CONSTRAINT subscriptions_period_valid_check
    CHECK (ends_at IS NULL OR starts_at IS NULL OR ends_at > starts_at);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE payments ADD CONSTRAINT payments_status_valid_check
    CHECK (status IN ('pending_review', 'verified', 'rejected', 'refunded'));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE payments ADD CONSTRAINT payments_amount_nonnegative_check
    CHECK (amount_egp >= 0);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS subscriptions_user_status_created_idx
  ON subscriptions (user_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS payments_subscription_status_idx
  ON payments (subscription_id, status);
CREATE UNIQUE INDEX IF NOT EXISTS subscriptions_one_pending_per_user_idx
  ON subscriptions (user_id) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS profiles_role_idx ON profiles (role);
CREATE INDEX IF NOT EXISTS profiles_membership_expiry_idx
  ON profiles (membership_plan, membership_expires_at);

COMMIT;
