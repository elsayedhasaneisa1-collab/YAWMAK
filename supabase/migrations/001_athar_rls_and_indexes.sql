-- ATHAR | أَثَر — PostgreSQL / Supabase Row Level Security & Performance Policies
-- Apply in Supabase SQL Editor or PostgreSQL environment with auth.uid() context

-- Enable RLS across all exposed user tables
ALTER TABLE IF EXISTS profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS verification_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS invitation_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS campaign_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS community_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS community_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS tasbih_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS legacy_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS studio_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS audit_logs ENABLE ROW LEVEL SECURITY;

-- Example Least-Privilege Policies (when deployed with Supabase Auth JWT)
-- 1. Profiles: users read/update only their own sensitive record
-- CREATE POLICY "profiles_self_select" ON profiles FOR SELECT USING (auth.uid() = id);
-- CREATE POLICY "profiles_self_update" ON profiles FOR UPDATE USING (auth.uid() = id);

-- 2. Private personal tables (strict ownership only)
-- CREATE POLICY "journal_owner_all" ON journal_entries FOR ALL USING (auth.uid() = user_id);
-- CREATE POLICY "habits_owner_all" ON habits FOR ALL USING (auth.uid() = user_id);
-- CREATE POLICY "goals_owner_all" ON goals FOR ALL USING (auth.uid() = user_id);
-- CREATE POLICY "bookmarks_owner_all" ON bookmarks FOR ALL USING (auth.uid() = user_id);
-- CREATE POLICY "notifications_owner_all" ON notifications FOR ALL USING (auth.uid() = user_id);
-- CREATE POLICY "settings_owner_all" ON user_settings FOR ALL USING (auth.uid() = user_id);

-- 3. Public-readable content with owner-only write
-- CREATE POLICY "invitations_public_read" ON invitations FOR SELECT USING (status = 'published' OR auth.uid() = user_id);
-- CREATE POLICY "invitations_owner_write" ON invitations FOR ALL USING (auth.uid() = user_id);
-- CREATE POLICY "campaigns_public_read" ON campaigns FOR SELECT USING (visibility = 'public' OR auth.uid() = creator_id);
-- CREATE POLICY "communities_public_read" ON communities FOR SELECT USING (privacy = 'public' OR auth.uid() = creator_id);
-- CREATE POLICY "legacy_public_read" ON legacy_items FOR SELECT USING (is_public = true OR auth.uid() = user_id);

-- 4. Administrative tables: service_role only (no direct anon/authenticated access)
-- REVOKE ALL ON audit_logs FROM anon, authenticated;
-- REVOKE ALL ON rate_limit_buckets FROM anon, authenticated;

-- Official 27 Egypt Governorates Check Constraint
ALTER TABLE profiles
  DROP CONSTRAINT IF EXISTS profiles_governorate_check;
ALTER TABLE profiles
  ADD CONSTRAINT profiles_governorate_check CHECK (
    governorate IN (
      'القاهرة','الجيزة','الإسكندرية','القليوبية','البحيرة','مطروح',
      'كفر الشيخ','الغربية','المنوفية','الدقهلية','دمياط','بورسعيد',
      'الإسماعيلية','السويس','شمال سيناء','جنوب سيناء','الشرقية',
      'الفيوم','بني سويف','المنيا','أسيوط','الوادي الجديد','سوهاج',
      'قنا','الأقصر','أسوان','البحر الأحمر'
    )
  );
