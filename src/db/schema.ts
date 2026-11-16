import {
  pgTable,
  text,
  integer,
  boolean,
  timestamp,
  jsonb,
  uuid,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const profiles = pgTable(
  "profiles",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    username: text("username").notNull().unique(),
    phone: text("phone").notNull().unique(),
    email: text("email"),
    passwordHash: text("password_hash").notNull(),
    passwordHint: text("password_hint").notNull(),
    gender: text("gender").notNull(), // 'male' | 'female' - NEVER exposed publicly
    governorate: text("governorate").notNull(), // One of Egypt's 27 official governorates
    role: text("role").notNull().default("user"), // user | support | moderator | admin | super_admin | owner
    accountStatus: text("account_status").notNull().default("active"), // active | suspended | banned | pending_review | deleted
    banReason: text("ban_reason"),
    bannedAt: timestamp("banned_at", { withTimezone: true }),
    bannedBy: uuid("banned_by"),
    membershipPlan: text("membership_plan").notNull().default("FREE"), // FREE | PLUS | PRO | VIP
    membershipStartsAt: timestamp("membership_starts_at", { withTimezone: true }),
    membershipExpiresAt: timestamp("membership_expires_at", { withTimezone: true }),
    verificationStatus: text("verification_status").notNull().default("none"), // none | pending | approved | rejected | revoked
    verificationBadge: text("verification_badge"), // PLUS VERIFIED | PRO VERIFIED | VIP VERIFIED
    onboardingCompleted: boolean("onboarding_completed").notNull().default(false),
    bio: text("bio"),
    publicProfile: boolean("public_profile").notNull().default(false),
    publicLinks: jsonb("public_links").$type<Array<{ label: string; url: string }>>().default([]),
    customAvatarUrl: text("custom_avatar_url"),
    termsAcceptedAt: timestamp("terms_accepted_at", { withTimezone: true }).notNull().defaultNow(),
    lastActiveAt: timestamp("last_active_at", { withTimezone: true }).defaultNow(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("profiles_governorate_idx").on(table.governorate),
    index("profiles_membership_idx").on(table.membershipPlan),
    index("profiles_status_idx").on(table.accountStatus),
    index("profiles_created_idx").on(table.createdAt),
  ]
);

export const sessions = pgTable(
  "sessions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    tokenHash: text("token_hash").notNull().unique(),
    userAgent: text("user_agent"),
    deviceOs: text("device_os").default("Unknown"),
    browser: text("browser").default("Unknown"),
    ipHash: text("ip_hash"),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    revokedAt: timestamp("revoked_at", { withTimezone: true }),
    lastActiveAt: timestamp("last_active_at", { withTimezone: true }).notNull().defaultNow(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("sessions_user_idx").on(table.userId),
    index("sessions_expires_idx").on(table.expiresAt),
  ]
);

export const membershipPlans = pgTable("membership_plans", {
  code: text("code").primaryKey(), // FREE | PLUS | PRO | VIP
  nameAr: text("name_ar").notNull(),
  nameEn: text("name_en").notNull(),
  priceEgp: integer("price_egp").notNull().default(0),
  invitationLimit: integer("invitation_limit").notNull().default(5), // -1 = unlimited (fair use)
  invitationLimitScope: text("invitation_limit_scope").notNull().default("lifetime"), // lifetime | monthly | fair_use
  habitLimit: integer("habit_limit").notNull().default(3), // -1 = unlimited (fair use)
  ogImageLimit: integer("og_image_limit").notNull().default(0),
  canVerify: boolean("can_verify").notNull().default(false),
  verificationPriority: integer("verification_priority").notNull().default(0),
  canUploadAvatar: boolean("can_upload_avatar").notNull().default(false),
  canUseStudio: boolean("can_use_studio").notNull().default(false),
  canCreatePrivateCampaign: boolean("can_create_private_campaign").notNull().default(false),
  canCreateCommunity: boolean("can_create_community").notNull().default(false),
  badgeLabel: text("badge_label"),
  features: jsonb("features").$type<string[]>().notNull().default([]),
  isActive: boolean("is_active").notNull().default(true),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const subscriptions = pgTable(
  "subscriptions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    planCode: text("plan_code")
      .notNull()
      .references(() => membershipPlans.code),
    status: text("status").notNull().default("pending"), // pending | active | expired | cancelled | rejected
    amountEgp: integer("amount_egp").notNull(),
    paymentMethod: text("payment_method").notNull(),
    paymentReference: text("payment_reference"),
    startsAt: timestamp("starts_at", { withTimezone: true }),
    endsAt: timestamp("ends_at", { withTimezone: true }),
    adminNote: text("admin_note"),
    reviewedBy: uuid("reviewed_by"),
    reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("subscriptions_user_idx").on(table.userId),
    index("subscriptions_status_idx").on(table.status),
  ]
);

export const payments = pgTable(
  "payments",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    subscriptionId: uuid("subscription_id").references(() => subscriptions.id, {
      onDelete: "set null",
    }),
    userId: uuid("user_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    planCode: text("plan_code").notNull(),
    amountEgp: integer("amount_egp").notNull(),
    currency: text("currency").notNull().default("EGP"),
    paymentMethod: text("payment_method").notNull(),
    referenceCode: text("reference_code"),
    status: text("status").notNull().default("pending_review"), // pending_review | verified | rejected | refunded
    notes: text("notes"),
    verifiedBy: uuid("verified_by"),
    verifiedAt: timestamp("verified_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("payments_user_idx").on(table.userId),
    index("payments_status_idx").on(table.status),
  ]
);

export const verificationRequests = pgTable(
  "verification_requests",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    planCode: text("plan_code").notNull(),
    priority: integer("priority").notNull().default(1),
    fullName: text("full_name").notNull(),
    reason: text("reason").notNull(),
    referenceUrl: text("reference_url"),
    status: text("status").notNull().default("pending"), // pending | approved | rejected | revoked
    badgeGranted: text("badge_granted"),
    decisionReason: text("decision_reason"),
    reviewedBy: uuid("reviewed_by"),
    reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("verification_user_idx").on(table.userId),
    index("verification_status_idx").on(table.status),
  ]
);

export const invitationImages = pgTable(
  "invitation_images",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    imageUrl: text("image_url").notNull(),
    altText: text("alt_text").notNull().default("YAWMAK"),
    contentType: text("content_type").notNull(),
    fileSizeBytes: integer("file_size_bytes").notNull().default(0),
    isActive: boolean("is_active").notNull().default(true),
    validatedAt: timestamp("validated_at", { withTimezone: true }).notNull().defaultNow(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("invitation_images_user_idx").on(table.userId)]
);

export const invitations = pgTable(
  "invitations",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    slug: text("slug").notNull().unique(),
    type: text("type").notNull(), // quran | adhkar | khatma | charity | occasion | personal | campaign
    title: text("title").notNull(),
    description: text("description").notNull(),
    templateId: text("template_id").notNull().default("emerald-royal"),
    themeColor: text("theme_color").notNull().default("#B89545"),
    fontFamily: text("font_family").notNull().default("amiri"),
    bgStyle: text("bg_style").notNull().default("midnight-emerald"),
    targetUrl: text("target_url"),
    ogImageId: uuid("og_image_id").references(() => invitationImages.id, {
      onDelete: "set null",
    }),
    status: text("status").notNull().default("published"), // draft | published | paused | removed
    metadata: jsonb("metadata").$type<Record<string, unknown>>().notNull().default({}),
    viewsCount: integer("views_count").notNull().default(0),
    sharesCount: integer("shares_count").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("invitations_user_idx").on(table.userId),
    index("invitations_status_idx").on(table.status),
    index("invitations_created_idx").on(table.createdAt),
  ]
);

export const campaigns = pgTable(
  "campaigns",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    creatorId: uuid("creator_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    slug: text("slug").notNull().unique(),
    title: text("title").notNull(),
    description: text("description").notNull(),
    imageUrl: text("image_url"),
    category: text("category").notNull().default("khatma"),
    goalTarget: integer("goal_target").notNull().default(100),
    currentProgress: integer("current_progress").notNull().default(0),
    unitLabel: text("unit_label").notNull().default("ختمة / مشاركة"),
    visibility: text("visibility").notNull().default("public"), // public | private
    status: text("status").notNull().default("active"), // active | paused | completed | archived | removed
    isFeatured: boolean("is_featured").notNull().default(false),
    startsAt: timestamp("starts_at", { withTimezone: true }).notNull().defaultNow(),
    endsAt: timestamp("ends_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("campaigns_creator_idx").on(table.creatorId),
    index("campaigns_visibility_status_idx").on(table.visibility, table.status),
  ]
);

export const campaignMembers = pgTable(
  "campaign_members",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    campaignId: uuid("campaign_id")
      .notNull()
      .references(() => campaigns.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    role: text("role").notNull().default("member"), // owner | moderator | member
    contribution: integer("contribution").notNull().default(0),
    assignedTask: text("assigned_task"),
    joinedAt: timestamp("joined_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("campaign_member_unique_idx").on(table.campaignId, table.userId),
    index("campaign_members_user_idx").on(table.userId),
  ]
);

export const communities = pgTable(
  "communities",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    creatorId: uuid("creator_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    slug: text("slug").notNull().unique(),
    name: text("name").notNull(),
    description: text("description").notNull(),
    rules: text("rules").notNull().default("الالتزام بالآداب الإسلامية، وحماية الخصوصية، وتجنب نشر البيانات الشخصية."),
    category: text("category").notNull().default("quran"),
    privacy: text("privacy").notNull().default("public"), // public | private
    status: text("status").notNull().default("active"), // active | suspended | archived
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("communities_status_idx").on(table.status)]
);

export const communityMembers = pgTable(
  "community_members",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    communityId: uuid("community_id")
      .notNull()
      .references(() => communities.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    role: text("role").notNull().default("member"), // owner | moderator | member
    status: text("status").notNull().default("active"), // active | banned
    joinedAt: timestamp("joined_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex("community_member_unique_idx").on(table.communityId, table.userId)]
);

export const communityPosts = pgTable(
  "community_posts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    communityId: uuid("community_id")
      .notNull()
      .references(() => communities.id, { onDelete: "cascade" }),
    authorId: uuid("author_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    content: text("content").notNull(),
    status: text("status").notNull().default("active"), // active | hidden | removed
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("community_posts_community_idx").on(table.communityId, table.createdAt)]
);

export const communityComments = pgTable(
  "community_comments",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    postId: uuid("post_id")
      .notNull()
      .references(() => communityPosts.id, { onDelete: "cascade" }),
    authorId: uuid("author_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    content: text("content").notNull(),
    status: text("status").notNull().default("active"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("community_comments_post_idx").on(table.postId)]
);

export const journalEntries = pgTable(
  "journal_entries",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    content: text("content").notNull(),
    category: text("category").notNull().default("reflection"),
    isFavorite: boolean("is_favorite").notNull().default(false),
    isArchived: boolean("is_archived").notNull().default(false),
    reminderAt: timestamp("reminder_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("journal_user_idx").on(table.userId, table.createdAt)]
);

export const habits = pgTable(
  "habits",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    category: text("category").notNull().default("worship"),
    targetCount: integer("target_count").notNull().default(1),
    currentStreak: integer("current_streak").notNull().default(0),
    totalCompletions: integer("total_completions").notNull().default(0),
    lastCompletedDate: text("last_completed_date"),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("habits_user_idx").on(table.userId)]
);

export const goals = pgTable(
  "goals",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    description: text("description"),
    category: text("category").notNull().default("quran"),
    targetValue: integer("target_value").notNull().default(30),
    currentValue: integer("current_value").notNull().default(0),
    unit: text("unit").notNull().default("جزء"),
    deadline: text("deadline"),
    status: text("status").notNull().default("active"), // active | completed | archived
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("goals_user_idx").on(table.userId)]
);

export const bookmarks = pgTable(
  "bookmarks",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    itemType: text("item_type").notNull(), // quran | adhkar | dua | invitation | campaign
    itemKey: text("item_key").notNull(),
    title: text("title").notNull(),
    subtitle: text("subtitle"),
    note: text("note"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("bookmarks_unique_idx").on(table.userId, table.itemType, table.itemKey),
  ]
);

export const tasbihProgress = pgTable(
  "tasbih_progress",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    dhikrKey: text("dhikr_key").notNull(),
    dhikrText: text("dhikr_text").notNull(),
    count: integer("count").notNull().default(0),
    target: integer("target").notNull().default(33),
    totalAllTime: integer("total_all_time").notNull().default(0),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex("tasbih_user_dhikr_idx").on(table.userId, table.dhikrKey)]
);

export const legacyItems = pgTable(
  "legacy_items",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    slug: text("slug").notNull().unique(),
    title: text("title").notNull(),
    category: text("category").notNull().default("initiative"),
    description: text("description").notNull(),
    externalUrl: text("external_url"),
    isPublic: boolean("is_public").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("legacy_user_idx").on(table.userId)]
);

export const studioProjects = pgTable(
  "studio_projects",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    category: text("category").notNull().default("card"),
    designJson: jsonb("design_json").$type<Record<string, unknown>>().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("studio_user_idx").on(table.userId)]
);

export const userSettings = pgTable("user_settings", {
  userId: uuid("user_id")
    .primaryKey()
    .references(() => profiles.id, { onDelete: "cascade" }),
  prayerCity: text("prayer_city").notNull().default("القاهرة"),
  prayerMethod: integer("prayer_method").notNull().default(5), // Egyptian General Authority of Survey
  hijriAdjustment: integer("hijri_adjustment").notNull().default(0),
  quranFontSize: integer("quran_font_size").notNull().default(28),
  lastQuranSurah: integer("last_quran_surah").notNull().default(1),
  lastQuranAyah: integer("last_quran_ayah").notNull().default(1),
  khatmaPlanDays: integer("khatma_plan_days").notNull().default(30),
  khatmaCurrentJuz: integer("khatma_current_juz").notNull().default(1),
  notificationsSystem: boolean("notifications_system").notNull().default(true),
  notificationsMembership: boolean("notifications_membership").notNull().default(true),
  notificationsCampaigns: boolean("notifications_campaigns").notNull().default(true),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const notifications = pgTable(
  "notifications",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    category: text("category").notNull().default("system"), // system | membership | invitation | campaign | support | admin
    title: text("title").notNull(),
    body: text("body").notNull(),
    actionUrl: text("action_url"),
    isRead: boolean("is_read").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("notifications_user_read_idx").on(table.userId, table.isRead)]
);

export const supportTickets = pgTable(
  "support_tickets",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").references(() => profiles.id, { onDelete: "set null" }),
    contactInfo: text("contact_info").notNull(),
    category: text("category").notNull().default("support"), // support | issue | privacy | appeal | other
    subject: text("subject").notNull(),
    message: text("message").notNull(),
    status: text("status").notNull().default("open"), // open | in_progress | resolved | closed
    adminReply: text("admin_reply"),
    repliedBy: uuid("replied_by"),
    repliedAt: timestamp("replied_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("support_tickets_status_idx").on(table.status)]
);

export const reports = pgTable(
  "reports",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    reporterId: uuid("reporter_id").references(() => profiles.id, { onDelete: "set null" }),
    targetType: text("target_type").notNull(), // invitation | campaign | community | post | comment | user
    targetId: text("target_id").notNull(),
    reason: text("reason").notNull(),
    details: text("details"),
    status: text("status").notNull().default("pending"), // pending | reviewed | resolved | dismissed
    reviewedBy: uuid("reviewed_by"),
    resolutionNote: text("resolution_note"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("reports_status_idx").on(table.status)]
);

export const auditLogs = pgTable(
  "audit_logs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    actorId: uuid("actor_id"),
    actorRole: text("actor_role").notNull().default("system"),
    action: text("action").notNull(),
    targetType: text("target_type").notNull(),
    targetId: text("target_id"),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("audit_logs_created_idx").on(table.createdAt)]
);

export const analyticsDaily = pgTable("analytics_daily", {
  dateKey: text("date_key").primaryKey(), // YYYY-MM-DD
  totalVisits: integer("total_visits").notNull().default(0),
  uniqueVisitors: integer("unique_visitors").notNull().default(0),
  returningVisitors: integer("returning_visitors").notNull().default(0),
  pageViews: integer("page_views").notNull().default(0),
  registrations: integer("registrations").notNull().default(0),
  androidCount: integer("android_count").notNull().default(0),
  iosCount: integer("ios_count").notNull().default(0),
  windowsCount: integer("windows_count").notNull().default(0),
  macosCount: integer("macos_count").notNull().default(0),
  chromeCount: integer("chrome_count").notNull().default(0),
  safariCount: integer("safari_count").notNull().default(0),
  firefoxCount: integer("firefox_count").notNull().default(0),
  edgeCount: integer("edge_count").notNull().default(0),
  peakHours: jsonb("peak_hours").$type<Record<string, number>>().notNull().default({}),
  trafficSources: jsonb("traffic_sources").$type<Record<string, number>>().notNull().default({}),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const analyticsPages = pgTable(
  "analytics_pages",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    dateKey: text("date_key").notNull(),
    path: text("path").notNull(),
    viewsCount: integer("views_count").notNull().default(0),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex("analytics_pages_date_path_idx").on(table.dateKey, table.path)]
);

export const apiHealthChecks = pgTable("api_health_checks", {
  apiName: text("api_name").primaryKey(),
  endpoint: text("endpoint").notNull(),
  status: text("status").notNull().default("healthy"), // healthy | degraded | down
  responseTimeMs: integer("response_time_ms").notNull().default(0),
  errorCount: integer("error_count").notNull().default(0),
  checksCount: integer("checks_count").notNull().default(0),
  lastError: text("last_error"),
  lastCheckedAt: timestamp("last_checked_at", { withTimezone: true }).notNull().defaultNow(),
});

export const systemSettings = pgTable("system_settings", {
  key: text("key").primaryKey(),
  value: jsonb("value").$type<unknown>().notNull(),
  updatedBy: uuid("updated_by"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const rateLimitBuckets = pgTable("rate_limit_buckets", {
  key: text("key").primaryKey(),
  count: integer("count").notNull().default(1),
  resetAt: timestamp("reset_at", { withTimezone: true }).notNull(),
});

export const dhikrCounters = pgTable(
  "dhikr_counters",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    scopeKey: text("scope_key").notNull().default("global"),
    invitationId: uuid("invitation_id").references(() => invitations.id, { onDelete: "cascade" }),
    dhikrKey: text("dhikr_key").notNull(),
    totalCount: integer("total_count").notNull().default(0),
    participantsCount: integer("participants_count").notNull().default(0),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("dhikr_counters_scope_key_idx").on(table.scopeKey, table.dhikrKey),
    index("dhikr_counters_invitation_idx").on(table.invitationId),
  ]
);

export const dhikrCounterContributors = pgTable(
  "dhikr_counter_contributors",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    counterId: uuid("counter_id")
      .notNull()
      .references(() => dhikrCounters.id, { onDelete: "cascade" }),
    contributorHash: text("contributor_hash").notNull(),
    contributionCount: integer("contribution_count").notNull().default(0),
    lastContributedAt: timestamp("last_contributed_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("dhikr_contributors_unique_idx").on(table.counterId, table.contributorHash),
    index("dhikr_contributors_hash_idx").on(table.contributorHash),
  ]
);

export const quranReadings = pgTable(
  "quran_readings",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").references(() => profiles.id, { onDelete: "set null" }),
    invitationId: uuid("invitation_id").references(() => invitations.id, { onDelete: "cascade" }),
    contributorHash: text("contributor_hash"),
    surahNumber: integer("surah_number").notNull(),
    surahName: text("surah_name"),
    completedAt: timestamp("completed_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("quran_readings_invitation_idx").on(table.invitationId, table.completedAt),
    index("quran_readings_user_idx").on(table.userId),
    index("quran_readings_surah_idx").on(table.surahNumber),
  ]
);
