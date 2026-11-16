"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Send,
  Plus,
  Copy,
  Pause,
  Play,
  Trash2,
  Image as ImageIcon,
  ExternalLink,
  Flag,
  ShieldCheck,
} from "@/components/ui/icons";
import {
  YawmakCard,
  YawmakBadge,
  YawmakButton,
  YawmakInput,
  YawmakTextarea,
  YawmakDialog,
  YawmakSkeleton,
  VerificationSeal,
} from "@/components/ui/DesignSystem";
import { INVITATION_TYPES, INVITATION_TEMPLATES } from "@/lib/constants";
import { useYawmak } from "@/components/providers/YawmakProvider";

function AtharInputField({
  label,
  value,
  onChange,
  dir,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  dir?: "ltr";
}) {
  return (
    <label className="block space-y-1.5">
      <span className="block text-sm font-medium text-[var(--yawmak-text)]">{label}</span>
      <input
        value={value}
        dir={dir}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-11 px-3.5 rounded-xl bg-[var(--yawmak-bg-elevated)] border border-[var(--yawmak-border)] text-sm text-[var(--yawmak-text)] outline-none focus:border-[var(--yawmak-primary)] transition-colors"
      />
    </label>
  );
}

interface InvitationRow {
  id: string;
  slug: string;
  type: string;
  title: string;
  description: string;
  templateId: string;
  themeColor: string;
  fontFamily: string;
  status: string;
  viewsCount: number;
  sharesCount: number;
  creatorName?: string;
  creatorBadge?: string | null;
}

interface OgImageRow {
  id: string;
  imageUrl: string;
  altText: string;
  contentType: string;
}

export default function InvitationsPage() {
  const { user, toast } = useYawmak();
  const [tab, setTab] = useState<"editor" | "mine" | "public" | "og">("public");
  const [publicList, setPublicList] = useState<InvitationRow[]>([]);
  const [myList, setMyList] = useState<InvitationRow[]>([]);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [sortBy, setSortBy] = useState<"newest" | "views" | "title">("newest");
  const [loadingList, setLoadingList] = useState(true);
  const [ogImages, setOgImages] = useState<OgImageRow[]>([]);
  const [quota, setQuota] = useState<{
    plan: string;
    limit: number;
    scope: string;
    used: number;
    ogImageLimit: number;
    ogImageUsed: number;
  } | null>(null);

  // Editor form state
  const [type, setType] = useState<string>("quran");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [mourningName, setMourningName] = useState("");
  const [mourningDate, setMourningDate] = useState("");
  const [mourningPhoto, setMourningPhoto] = useState("");
  const [mourningMessage, setMourningMessage] = useState("");
  const [mourningDua, setMourningDua] = useState("");
  const [groomName, setGroomName] = useState("");
  const [brideName, setBrideName] = useState("");
  const [groomFamily, setGroomFamily] = useState("");
  const [brideFamily, setBrideFamily] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventTime, setEventTime] = useState("");
  const [venue, setVenue] = useState("");
  const [venueUrl, setVenueUrl] = useState("");
  const [personName, setPersonName] = useState("");
  const [occasion, setOccasion] = useState("عيد ميلاد");
  const [congratsMessage, setCongratsMessage] = useState("");
  const [senderName, setSenderName] = useState("");
  const [typeImageUrl, setTypeImageUrl] = useState("");
  const [templateId, setTemplateId] = useState<string>("emerald-royal");
  const [themeColor, setThemeColor] = useState("#B89545");
  const [fontFamily, setFontFamily] = useState<"amiri" | "cairo" | "tajawal">("amiri");
  const [targetUrl, setTargetUrl] = useState("");
  const [selectedOgId, setSelectedOgId] = useState("");
  const [status, setStatus] = useState<"published" | "draft">("published");
  const [submitting, setSubmitting] = useState(false);

  // OG Image Add form
  const [newOgUrl, setNewOgUrl] = useState("");
  const [newOgAlt, setNewOgAlt] = useState("");
  const [addingOg, setAddingOg] = useState(false);

  // Report dialog
  const [reportTargetId, setReportTargetId] = useState<string | null>(null);
  const [reportReason, setReportReason] = useState("محتوى مخالف");

  const loadAll = () => {
    setLoadingList(true);
    fetch("/api/invitations?scope=public")
      .then((r) => r.json())
      .then((d) => setPublicList(d.invitations || []))
      .catch(() => undefined)
      .finally(() => setLoadingList(false));

    if (user) {
      fetch("/api/invitations?scope=mine")
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => {
          if (!d) return;
          setMyList(d.invitations || []);
          setOgImages(d.ogImages || []);
          setQuota(d.quota || null);
        })
        .catch(() => undefined);
    }
  };

  useEffect(() => {
    const boot = window.setTimeout(loadAll, 0);
    return () => window.clearTimeout(boot);
  }, [user]);

  const createInvitation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({ type: "warning", title: "يرجى تسجيل الدخول لإنشاء دعوة" });
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/invitations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          title,
          description,
          templateId,
          themeColor,
          fontFamily,
          targetUrl,
          ogImageId: selectedOgId || null,
          status,
          metadata:
            type === "mourning"
              ? {
                  deceasedName: mourningName,
                  deceasedPhotoUrl: mourningPhoto,
                  deceasedDate: mourningDate,
                  senderMessage: mourningMessage,
                  dedicationDua: mourningDua,
                }
              : type === "wedding_attendance"
              ? {
                  groomName,
                  brideName,
                  groomFamily,
                  brideFamily,
                  eventDate,
                  eventTime,
                  venue,
                  venueUrl,
                  invitationMessage: description,
                  imageUrl: typeImageUrl,
                }
              : type === "wedding_congrats"
              ? {
                  groomName,
                  brideName,
                  message: description,
                  senderName,
                  imageUrl: typeImageUrl,
                }
              : type === "birthday"
              ? {
                  personName,
                  occasion,
                  eventDate,
                  message: description,
                  imageUrl: typeImageUrl,
                }
              : type === "congrats"
              ? {
                  personName,
                  occasion: occasion || "تهنئة",
                  message: description,
                  senderName,
                }
              : {},
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast({ type: "error", title: data.error || "تعذر إنشاء الدعوة" });
      } else {
        toast({ type: "success", title: "تم حفظ الدعوة بنجاح" });
        setTitle("");
        setDescription("");
        setTargetUrl("");
        setTab("mine");
        loadAll();
      }
    } finally {
      setSubmitting(false);
    }
  };

  const toggleStatus = async (inv: InvitationRow) => {
    const next = inv.status === "published" ? "paused" : "published";
    const res = await fetch("/api/invitations", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: inv.id, status: next }),
    });
    if (res.ok) {
      loadAll();
      toast({ type: "success", title: next === "published" ? "تم نشر الدعوة" : "تم إيقاف الدعوة مؤقتًا" });
    }
  };

  const deleteInvitation = async (id: string) => {
    const res = await fetch(`/api/invitations?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    if (res.ok) {
      loadAll();
      toast({ type: "success", title: "تم حذف الدعوة" });
    }
  };

  const addOgImageUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddingOg(true);
    try {
      const res = await fetch("/api/invitations/og-images", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl: newOgUrl, altText: newOgAlt }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast({ type: "error", title: data.error || "تم رفض رابط الصورة" });
      } else {
        toast({ type: "success", title: "تم التحقق من الرابط وإضافته إلى مكتبة OG" });
        setNewOgUrl("");
        setNewOgAlt("");
        loadAll();
      }
    } finally {
      setAddingOg(false);
    }
  };

  const deleteOgImage = async (id: string) => {
    await fetch(`/api/invitations/og-images?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    loadAll();
  };

  const submitReport = async () => {
    if (!reportTargetId) return;
    const res = await fetch("/api/reports", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ targetType: "invitation", targetId: reportTargetId, reason: reportReason }),
    });
    const d = await res.json();
    toast({ type: res.ok ? "success" : "error", title: d.message || d.error });
    setReportTargetId(null);
  };

  const copyShareUrl = (slug: string) => {
    const url = `${window.location.origin}/invitations/${slug}`;
    navigator.clipboard.writeText(url).catch(() => undefined);
    fetch("/api/invitations", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ trackShare: true, slug }),
    }).catch(() => undefined);
    toast({ type: "success", title: "تم نسخ رابط الدعوة بمعاينة Open Graph" });
  };

  const activeTemplate = INVITATION_TEMPLATES.find((t) => t.id === templateId) || INVITATION_TEMPLATES[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-1.5">
          <YawmakBadge tone="gold">
            <Send className="w-3.5 h-3.5" /> YAWMAK INVITATIONS — دعوات ومعاينات Open Graph
          </YawmakBadge>
          <h1 className="font-display text-3xl sm:text-4xl font-bold yawmak-gold-text">بطاقاتي</h1>
          <p className="text-xs sm:text-sm text-[var(--yawmak-text-muted)]">
            أنشئ بطاقات ودعوات للمشاركة مع معاينة فورية ورابط ثابت ورمز QR.
          </p>
        </div>

        {quota && (
          <div className="px-4 py-2.5 rounded-2xl bg-white/[0.04] border border-[var(--yawmak-border)] text-xs space-y-0.5">
            <p>
              رصيد الدعوات ({quota.plan}):{" "}
              <strong className="text-[var(--yawmak-gold-soft)]">
                {quota.used} / {quota.limit === -1 ? "غير محدود" : quota.limit}
              </strong>
            </p>
            <p className="text-[11px] text-[var(--yawmak-text-muted)]">
              صور OG المخصصة: {quota.ogImageUsed} / {quota.ogImageLimit} رابط للحساب
            </p>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="ابحث في البطاقات..."
          className="h-10 flex-1 min-w-[180px] px-3.5 rounded-xl bg-[var(--yawmak-card)] border border-[var(--yawmak-border)] text-sm outline-none focus:border-[var(--yawmak-primary)]"
        />
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="h-10 px-3 rounded-xl bg-[var(--yawmak-card)] border border-[var(--yawmak-border)] text-xs outline-none cursor-pointer"
        >
          <option value="all">كل الأنواع</option>
          {INVITATION_TYPES.map((t) => (
            <option key={t.id} value={t.id}>
              {t.label}
            </option>
          ))}
        </select>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as "newest" | "views" | "title")}
          className="h-10 px-3 rounded-xl bg-[var(--yawmak-card)] border border-[var(--yawmak-border)] text-xs outline-none cursor-pointer"
        >
          <option value="newest">الأحدث</option>
          <option value="views">الأكثر مشاهدة</option>
          <option value="title">الاسم</option>
        </select>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        {(
          [
            { id: "public", label: "الدعوات العامة" },
            { id: "editor", label: "إنشاء دعوة جديدة" },
            { id: "mine", label: `دعواتي (${myList.length})` },
            { id: "og", label: "مكتبة روابط صور OG" },
          ] as const
        ).map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
              tab === t.id
                ? "yawmak-gold-gradient text-[#FFFFFF] border-transparent"
                : "bg-white/[0.03] border-[var(--yawmak-border-subtle)] text-[var(--yawmak-text-muted)]"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* EDITOR TAB */}
      {tab === "editor" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-7">
            <YawmakCard>
              <form onSubmit={createInvitation} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium">نوع الدعوة</label>
                    <select
                      value={type}
                      onChange={(e) => {
                        const nextType = e.target.value;
                        setType(nextType);
                        if (nextType === "mourning") {
                          setTemplateId("sakina-memory");
                          setThemeColor("#B89545");
                          setFontFamily("amiri");
                        }
                      }}
                      className="w-full h-11 px-3 rounded-xl bg-[var(--yawmak-bg-elevated)] border border-[var(--yawmak-border-subtle)] text-sm"
                    >
                      {INVITATION_TYPES.map((it) => (
                        <option key={it.id} value={it.id}>
                          {it.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium">القالب البصري</label>
                    <select
                      value={templateId}
                      onChange={(e) => setTemplateId(e.target.value)}
                      className="w-full h-11 px-3 rounded-xl bg-[var(--yawmak-bg-elevated)] border border-[var(--yawmak-border-subtle)] text-sm"
                    >
                      {INVITATION_TEMPLATES.map((tpl) => (
                        <option key={tpl.id} value={tpl.id}>
                          {tpl.name} ({tpl.minPlan}+)
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <YawmakInput
                  label="عنوان الدعوة"
                  required
                  placeholder="مثال: دعوة للمشاركة في ختمة سورة الكهف يوم الجمعة"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />

                <YawmakTextarea
                  label="نص وتفاصيل الدعوة"
                  required
                  placeholder="اكتب رسالة مؤثرة واضحة تدعو إلى الخير..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />

                {type === "wedding_attendance" && (
                  <div className="rounded-2xl border border-[var(--yawmak-border)] p-4 space-y-3">
                    <p className="text-xs font-bold text-[var(--yawmak-primary)]">بيانات حفل الزفاف</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <AtharInputField label="اسم العريس" value={groomName} onChange={setGroomName} />
                      <AtharInputField label="اسم العروس" value={brideName} onChange={setBrideName} />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <AtharInputField label="عائلة العريس (اختياري)" value={groomFamily} onChange={setGroomFamily} />
                      <AtharInputField label="عائلة العروس (اختياري)" value={brideFamily} onChange={setBrideFamily} />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <AtharInputField label="التاريخ" value={eventDate} onChange={setEventDate} />
                      <AtharInputField label="الوقت" value={eventTime} onChange={setEventTime} />
                    </div>
                    <AtharInputField label="مكان الحفل" value={venue} onChange={setVenue} />
                    <AtharInputField label="رابط الموقع (اختياري)" dir="ltr" value={venueUrl} onChange={setVenueUrl} />
                    <AtharInputField label="صورة اختيارية" dir="ltr" value={typeImageUrl} onChange={setTypeImageUrl} />
                  </div>
                )}

                {type === "wedding_congrats" && (
                  <div className="rounded-2xl border border-[var(--yawmak-border)] p-4 space-y-3">
                    <p className="text-xs font-bold text-[var(--yawmak-primary)]">بيانات التهنئة</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <AtharInputField label="اسم العريس" value={groomName} onChange={setGroomName} />
                      <AtharInputField label="اسم العروس" value={brideName} onChange={setBrideName} />
                    </div>
                    <AtharInputField label="اسم المرسل (اختياري)" value={senderName} onChange={setSenderName} />
                    <AtharInputField label="صورة اختيارية" dir="ltr" value={typeImageUrl} onChange={setTypeImageUrl} />
                  </div>
                )}

                {type === "birthday" && (
                  <div className="rounded-2xl border border-[var(--yawmak-border)] p-4 space-y-3">
                    <p className="text-xs font-bold text-[var(--yawmak-primary)]">بيانات المناسبة</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <AtharInputField label="الاسم" value={personName} onChange={setPersonName} />
                      <AtharInputField label="المناسبة" value={occasion} onChange={setOccasion} />
                    </div>
                    <AtharInputField label="التاريخ (اختياري)" value={eventDate} onChange={setEventDate} />
                    <AtharInputField label="صورة اختيارية" dir="ltr" value={typeImageUrl} onChange={setTypeImageUrl} />
                  </div>
                )}

                {type === "congrats" && (
                  <div className="rounded-2xl border border-[var(--yawmak-border)] p-4 space-y-3">
                    <p className="text-xs font-bold text-[var(--yawmak-primary)]">بيانات التهنئة</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <AtharInputField label="الاسم" value={personName} onChange={setPersonName} />
                      <AtharInputField label="المناسبة" value={occasion} onChange={setOccasion} />
                    </div>
                    <AtharInputField label="اسم المرسل (اختياري)" value={senderName} onChange={setSenderName} />
                  </div>
                )}

                {type === "mourning" && (
                  <div className="rounded-2xl border border-[var(--yawmak-border)] bg-white/[0.02] p-4 space-y-3">
                    <p className="text-xs font-bold text-[var(--yawmak-gold-soft)]">
                      بيانات الدعوة على روح فقيد
                    </p>
                    <YawmakInput
                      label="اسم المتوفى"
                      required
                      placeholder="مثال: عبد الله محمد"
                      value={mourningName}
                      onChange={(e) => setMourningName(e.target.value)}
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <YawmakInput
                        label="تاريخ الوفاة (اختياري)"
                        placeholder="مثال: ١٤٤٧ هـ — ٢٠٢٥ م"
                        value={mourningDate}
                        onChange={(e) => setMourningDate(e.target.value)}
                      />
                      <YawmakInput
                        label="رابط صورة المتوفى (اختياري)"
                        dir="ltr"
                        type="url"
                        placeholder="https://..."
                        value={mourningPhoto}
                        onChange={(e) => setMourningPhoto(e.target.value)}
                      />
                    </div>
                    <YawmakTextarea
                      label="رسالة من صاحب الدعوة"
                      required
                      placeholder="كلمة هادئة تُذكر بها الفقيد..."
                      value={mourningMessage}
                      onChange={(e) => setMourningMessage(e.target.value)}
                    />
                    <YawmakTextarea
                      label="دعاء خاص للمتوفى (اختياري)"
                      placeholder="اللَّهُمَّ اغْفِرْ لَهُ وَارْحَمْهُ..."
                      value={mourningDua}
                      onChange={(e) => setMourningDua(e.target.value)}
                    />
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium">لون اللمسة</label>
                    <input
                      type="color"
                      value={themeColor}
                      onChange={(e) => setThemeColor(e.target.value)}
                      className="w-full h-11 p-1 rounded-xl bg-[var(--yawmak-bg-elevated)] border border-[var(--yawmak-border-subtle)] cursor-pointer"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium">الخط</label>
                    <select
                      value={fontFamily}
                      onChange={(e) => setFontFamily(e.target.value as "amiri" | "cairo" | "tajawal")}
                      className="w-full h-11 px-3 rounded-xl bg-[var(--yawmak-bg-elevated)] border border-[var(--yawmak-border-subtle)] text-sm"
                    >
                      <option value="amiri">أميري (كلاسيكي فاخر)</option>
                      <option value="cairo">القاهرة (عصري)</option>
                      <option value="tajawal">تجوال (هادئ)</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium">الحالة</label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as "published" | "draft")}
                      className="w-full h-11 px-3 rounded-xl bg-[var(--yawmak-bg-elevated)] border border-[var(--yawmak-border-subtle)] text-sm"
                    >
                      <option value="published">نشر فوري</option>
                      <option value="draft">حفظ كمسودة</option>
                    </select>
                  </div>
                </div>

                <YawmakInput
                  label="رابط إضافي (اختياري — HTTPS فقط)"
                  type="url"
                  dir="ltr"
                  placeholder="https://..."
                  value={targetUrl}
                  onChange={(e) => setTargetUrl(e.target.value)}
                />

                {ogImages.length > 0 && (
                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium">صورة Open Graph من مكتبة حسابك</label>
                    <select
                      value={selectedOgId}
                      onChange={(e) => setSelectedOgId(e.target.value)}
                      className="w-full h-11 px-3 rounded-xl bg-[var(--yawmak-bg-elevated)] border border-[var(--yawmak-border-subtle)] text-sm"
                    >
                      <option value="">صورة YAWMAK الافتراضية (1200×630)</option>
                      {ogImages.map((img) => (
                        <option key={img.id} value={img.id}>
                          {img.altText} — {img.imageUrl.slice(0, 45)}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <YawmakButton type="submit" variant="primary" size="lg" loading={submitting} className="w-full">
                  <Plus className="w-4 h-4" /> حفظ ونشر الدعوة
                </YawmakButton>
              </form>
            </YawmakCard>
          </div>

          {/* LIVE PREVIEW */}
          <div className="lg:col-span-5 space-y-3">
            <p className="text-xs font-bold text-[var(--yawmak-gold-soft)]">معاينة بطاقة الدعوة الفورية</p>
            <div
              className="rounded-3xl p-7 min-h-[320px] flex flex-col justify-between text-center shadow-2xl border-2"
              style={{
                background: activeTemplate.bg,
                borderColor: themeColor,
                color: activeTemplate.id === "ivory-mosque" ? "#292638" : "#292638",
              }}
            >
              <p className="text-[11px] tracking-[0.22em] opacity-80" style={{ color: themeColor }}>
                دعوة إلى الخير
              </p>
              <div className="space-y-3 my-6">
                <h2
                  className={`text-2xl sm:text-3xl font-bold leading-snug ${
                    fontFamily === "amiri" ? "font-quran" : ""
                  }`}
                  style={{ color: themeColor }}
                >
                  {type === "mourning"
                    ? title || "«اجعل له دعاءً لا ينقطع»"
                    : title || "عنوان دعوتك سيظهر هنا"}
                </h2>
                <p className="text-sm leading-relaxed opacity-90 whitespace-pre-line">
                  {type === "mourning"
                    ? description ||
                      "ساهم بالذكر والدعاء وقراءة القرآن الكريم، ونسأل الله أن يتغمده بواسع رحمته."
                    : description ||
                      "اكتب تفاصيل الدعوة لتظهر هنا بمعاينة فورية راقية جاهزة للنشر والمشاركة."}
                </p>
                {type === "mourning" && (
                  <p className="text-xs opacity-85" style={{ color: themeColor }}>
                    {mourningName ? `نتذكر: ${mourningName}` : "اسم الفقيد سيظهر هنا"}
                  </p>
                )}
              </div>
              <p className="text-[11px] opacity-75">بمشاركة من صاحب الدعوة</p>
            </div>
          </div>
        </div>
      )}

      {/* MY INVITATIONS TAB */}
      {tab === "mine" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {!user ? (
            <YawmakCard className="col-span-full">
              <p className="text-sm text-[var(--yawmak-text-muted)]">يرجى تسجيل الدخول لإدارة دعواتك.</p>
            </YawmakCard>
          ) : myList.length === 0 ? (
            <YawmakCard className="col-span-full text-center py-8 space-y-3">
              <p className="text-sm text-[var(--yawmak-text-muted)]">لم تنشئ أي دعوة بعد.</p>
              <YawmakButton variant="primary" size="sm" onClick={() => setTab("editor")}>
                إنشاء أول دعوة
              </YawmakButton>
            </YawmakCard>
          ) : (
            myList.map((inv) => (
              <YawmakCard key={inv.id} className="yawmak-card-3d flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <YawmakBadge tone={inv.status === "published" ? "emerald" : "neutral"}>
                      {inv.status === "published" ? "منشورة" : inv.status === "draft" ? "مسودة" : "متوقفة"}
                    </YawmakBadge>
                    <span className="text-[11px] text-[var(--yawmak-text-muted)]">
                      {inv.viewsCount} مشاهدة • {inv.sharesCount} مشاركة
                    </span>
                  </div>
                  <h3 className="font-bold text-base">{inv.title}</h3>
                  <p className="text-xs text-[var(--yawmak-text-muted)] line-clamp-3">{inv.description}</p>
                </div>

                <div className="flex flex-wrap items-center gap-1.5 pt-3 border-t border-[var(--yawmak-border-subtle)]">
                  <Link href={`/invitations/${inv.slug}`}>
                    <YawmakButton variant="outline" size="sm">
                      <ExternalLink className="w-3.5 h-3.5" /> فتح
                    </YawmakButton>
                  </Link>
                  <YawmakButton variant="ghost" size="sm" onClick={() => copyShareUrl(inv.slug)}>
                    <Copy className="w-3.5 h-3.5" /> نسخ
                  </YawmakButton>
                  <YawmakButton variant="ghost" size="sm" onClick={() => toggleStatus(inv)}>
                    {inv.status === "published" ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  </YawmakButton>
                  <YawmakButton variant="ghost" size="sm" onClick={() => deleteInvitation(inv.id)}>
                    <Trash2 className="w-3.5 h-3.5 text-red-400" />
                  </YawmakButton>
                </div>
              </YawmakCard>
            ))
          )}
        </div>
      )}

      {/* PUBLIC INVITATIONS TAB */}
      {tab === "public" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {loadingList ? (
              <>
                <YawmakSkeleton className="h-64" />
                <YawmakSkeleton className="h-64" />
                <YawmakSkeleton className="h-64" />
              </>
            ) : publicList.length === 0 ? (
            <YawmakCard className="col-span-full text-center py-10 space-y-3">
              <p className="text-sm text-[var(--yawmak-text-muted)]">لا توجد دعوات عامة منشورة حاليًا. كن أول من ينشر دعوة خير!</p>
              <YawmakButton variant="primary" size="sm" onClick={() => setTab("editor")}>
                إنشاء دعوة الآن
              </YawmakButton>
            </YawmakCard>
          ) : (
            publicList
              .filter((inv) => typeFilter === "all" || inv.type === typeFilter)
              .filter((inv) => inv.title.includes(search.trim()))
              .sort((a, b) => {
                if (sortBy === "views") return b.viewsCount - a.viewsCount;
                if (sortBy === "title") return a.title.localeCompare(b.title, "ar");
                return 0;
              })
              .map((inv) => (
              <YawmakCard key={inv.id} className="yawmak-card-3d flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <YawmakBadge tone="gold">
                      {INVITATION_TYPES.find((t) => t.id === inv.type)?.label || inv.type}
                    </YawmakBadge>
                    <button
                      type="button"
                      onClick={() => setReportTargetId(inv.id)}
                      title="الإبلاغ عن محتوى مخالف"
                      className="text-[var(--yawmak-text-muted)] hover:text-red-400 p-1 cursor-pointer"
                    >
                      <Flag className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <h3 className="font-bold text-base">{inv.title}</h3>
                  <p className="text-xs text-[var(--yawmak-text-muted)] line-clamp-3">{inv.description}</p>
                </div>

                <div className="space-y-3 pt-3 border-t border-[var(--yawmak-border-subtle)]">
                  <div className="flex items-center justify-between text-[11px] text-[var(--yawmak-text-muted)]">
                    <span className="flex items-center gap-1.5">
                      {inv.creatorName}
                      <VerificationSeal badge={inv.creatorBadge} />
                    </span>
                    <span>{inv.viewsCount} مشاهدة</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link href={`/invitations/${inv.slug}`} className="flex-1">
                      <YawmakButton variant="secondary" size="sm" className="w-full">
                        عرض الدعوة
                      </YawmakButton>
                    </Link>
                    <YawmakButton variant="outline" size="sm" onClick={() => copyShareUrl(inv.slug)}>
                      <Copy className="w-3.5 h-3.5" />
                    </YawmakButton>
                  </div>
                </div>
              </YawmakCard>
            ))
          )}
        </div>
      )}

      {/* OG IMAGES LIBRARY TAB (PRO VERIFIED: 5, VIP VERIFIED: 50, HTTPS SSRF PROTECTED) */}
      {tab === "og" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5">
            <YawmakCard className="space-y-4">
              <div className="flex items-center gap-2 font-bold text-sm text-[var(--yawmak-gold-soft)]">
                <ImageIcon className="w-4 h-4" /> إضافة رابط صورة Open Graph مباشرة
              </div>
              <p className="text-xs text-[var(--yawmak-text-muted)] leading-relaxed">
                متاح حصريًا لحسابات <strong>PRO VERIFIED</strong> (5 روابط للحساب) و<strong>VIP VERIFIED</strong> (50 رابطًا للحساب). يُعاد استخدام الصور عبر عدة دعوات دون رفع ملفات، ويتم فحص كل رابط ضد SSRF والتأكد من كونه PNG/JPG/WebP عبر HTTPS.
              </p>
              <form onSubmit={addOgImageUrl} className="space-y-3">
                <YawmakInput
                  label="رابط الصورة المباشر (HTTPS)"
                  required
                  type="url"
                  dir="ltr"
                  placeholder="https://example.com/banner-1200x630.png"
                  value={newOgUrl}
                  onChange={(e) => setNewOgUrl(e.target.value)}
                />
                <YawmakInput
                  label="الوصف البديل (Alt Text)"
                  required
                  placeholder="وصف مختصر للصورة"
                  value={newOgAlt}
                  onChange={(e) => setNewOgAlt(e.target.value)}
                />
                <YawmakButton type="submit" variant="primary" loading={addingOg} className="w-full">
                  <ShieldCheck className="w-4 h-4" /> فحص وإضافة الرابط
                </YawmakButton>
              </form>
            </YawmakCard>
          </div>
          <div className="lg:col-span-7 space-y-3">
            {ogImages.length === 0 ? (
              <YawmakCard>
                <p className="text-sm text-[var(--yawmak-text-muted)]">
                  لا توجد روابط صور مخصصة حاليًا. تستخدم جميع البطاقات الصورة الافتراضية (1200×630).
                </p>
              </YawmakCard>
            ) : (
              ogImages.map((img) => (
                <YawmakCard key={img.id} className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-bold truncate">{img.altText}</p>
                    <p className="text-xs text-[var(--yawmak-text-muted)] font-mono truncate">{img.imageUrl}</p>
                  </div>
                  <YawmakButton variant="danger" size="sm" onClick={() => deleteOgImage(img.id)}>
                    حذف
                  </YawmakButton>
                </YawmakCard>
              ))
            )}
          </div>
        </div>
      )}

      {/* Report Dialog */}
      <YawmakDialog
        open={Boolean(reportTargetId)}
        onClose={() => setReportTargetId(null)}
        title="الإبلاغ عن محتوى مخالف"
        tone="warning"
        footer={
          <>
            <YawmakButton variant="ghost" size="sm" onClick={() => setReportTargetId(null)}>
              إلغاء
            </YawmakButton>
            <YawmakButton variant="danger" size="sm" onClick={submitReport}>
              إرسال البلاغ
            </YawmakButton>
          </>
        }
      >
        <YawmakInput
          label="سبب البلاغ"
          value={reportReason}
          onChange={(e) => setReportReason(e.target.value)}
        />
      </YawmakDialog>
    </div>
  );
}
