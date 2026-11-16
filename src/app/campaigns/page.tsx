"use client";

import React, { useEffect, useState } from "react";
import { Users, Plus, CheckCircle2, Flag, Pause, Play } from "@/components/ui/icons";
import {
  YawmakCard,
  YawmakBadge,
  YawmakButton,
  YawmakInput,
  YawmakTextarea,
  YawmakProgressBar,
  YawmakDialog,
  VerificationSeal,
} from "@/components/ui/DesignSystem";
import { useYawmak } from "@/components/providers/YawmakProvider";

interface CampaignItem {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: string;
  goalTarget: number;
  currentProgress: number;
  unitLabel: string;
  visibility: string;
  status: string;
  creatorName: string;
  creatorBadge: string | null;
  participantsCount: number;
  isJoined: boolean;
  isOwner: boolean;
}

export default function CampaignsPage() {
  const { user, toast } = useYawmak();
  const [list, setList] = useState<CampaignItem[]>([]);
  const [createOpen, setCreateOpen] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("khatma");
  const [goalTarget, setGoalTarget] = useState(100);
  const [unitLabel, setUnitLabel] = useState("جزء / مشاركة");
  const [visibility, setVisibility] = useState<"public" | "private">("public");
  const [saving, setSaving] = useState(false);

  const loadCampaigns = () => {
    fetch("/api/campaigns")
      .then((r) => r.json())
      .then((d) => setList(d.campaigns || []))
      .catch(() => undefined);
  };

  useEffect(() => {
    loadCampaigns();
  }, [user]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, category, goalTarget, unitLabel, visibility }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast({ type: "error", title: data.error || "تعذر إنشاء الحملة" });
      } else {
        toast({ type: "success", title: "تم إطلاق الحملة بنجاح" });
        setCreateOpen(false);
        setTitle("");
        setDescription("");
        loadCampaigns();
      }
    } finally {
      setSaving(false);
    }
  };

  const joinCampaign = async (campaignId: string) => {
    if (!user) {
      toast({ type: "warning", title: "سجّل الدخول للمشاركة في الحملات" });
      return;
    }
    const res = await fetch("/api/campaigns", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "join", campaignId }),
    });
    if (res.ok) {
      toast({ type: "success", title: "تم انضمامك إلى الحملة" });
      loadCampaigns();
    }
  };

  const contribute = async (campaignId: string) => {
    if (!user) {
      toast({ type: "warning", title: "سجّل الدخول لتسجيل مساهمتك" });
      return;
    }
    const res = await fetch("/api/campaigns", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "contribute", campaignId, amount: 1 }),
    });
    if (res.ok) {
      toast({ type: "success", title: "بارك الله فيك — تم تسجيل مشاركتك" });
      loadCampaigns();
    }
  };

  const toggleStatus = async (camp: CampaignItem) => {
    const next = camp.status === "active" ? "paused" : "active";
    const res = await fetch("/api/campaigns", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: camp.id, status: next }),
    });
    if (res.ok) loadCampaigns();
  };

  const reportCampaign = async (id: string) => {
    const res = await fetch("/api/reports", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ targetType: "campaign", targetId: id, reason: "بلاغ مراجعة حملة" }),
    });
    const d = await res.json();
    toast({ type: res.ok ? "success" : "error", title: d.message || d.error });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-1.5">
          <YawmakBadge tone="emerald">
            <Users className="w-3.5 h-3.5" /> YAWMAK CAMPAIGNS — حملات الخير الجماعية
          </YawmakBadge>
          <h1 className="font-display text-3xl sm:text-4xl font-bold yawmak-gold-text">الحملات</h1>
          <p className="text-xs sm:text-sm text-[var(--yawmak-text-muted)]">
            شارك في الحملات العامة والخاصة وتابع تقدمها.
          </p>
        </div>

        <YawmakButton
          variant="primary"
          onClick={() => {
            if (!user) {
              toast({ type: "warning", title: "يرجى تسجيل الدخول لإنشاء حملة" });
              return;
            }
            setCreateOpen(true);
          }}
        >
          <Plus className="w-4 h-4" /> إنشاء حملة جديدة
        </YawmakButton>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {list.map((camp) => (
          <YawmakCard key={camp.id} className="flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <YawmakBadge tone={camp.status === "active" ? "emerald" : "neutral"}>
                    {camp.status === "active" ? "نشطة" : "متوقفة"}
                  </YawmakBadge>
                  <YawmakBadge tone="gold">{camp.visibility === "private" ? "خاصة" : "عامة"}</YawmakBadge>
                </div>
                <button
                  type="button"
                  onClick={() => reportCampaign(camp.id)}
                  className="text-[var(--yawmak-text-muted)] hover:text-red-400 cursor-pointer"
                  title="إبلاغ"
                >
                  <Flag className="w-3.5 h-3.5" />
                </button>
              </div>

              <h2 className="text-lg font-bold">{camp.title}</h2>
              <p className="text-xs text-[var(--yawmak-text-muted)] leading-relaxed">{camp.description}</p>

              <div className="space-y-1.5">
                <YawmakProgressBar value={camp.currentProgress} max={camp.goalTarget} />
                <div className="flex items-center justify-between text-xs text-[var(--yawmak-text-muted)]">
                  <span>
                    <strong className="text-[var(--yawmak-gold-soft)]">{camp.currentProgress}</strong> /{" "}
                    {camp.goalTarget} {camp.unitLabel}
                  </span>
                  <span>{camp.participantsCount} مشارك</span>
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-3 border-t border-[var(--yawmak-border-subtle)]">
              <div className="flex items-center gap-1.5 text-[11px] text-[var(--yawmak-text-muted)]">
                <span>المنشئ: {camp.creatorName}</span>
                <VerificationSeal badge={camp.creatorBadge} />
              </div>

              <div className="flex items-center gap-2">
                {camp.isJoined ? (
                  <YawmakButton variant="primary" size="sm" className="flex-1" onClick={() => contribute(camp.id)}>
                    <CheckCircle2 className="w-4 h-4" /> تسجيل +1 {camp.unitLabel}
                  </YawmakButton>
                ) : (
                  <YawmakButton variant="secondary" size="sm" className="flex-1" onClick={() => joinCampaign(camp.id)}>
                    الانضمام للحملة
                  </YawmakButton>
                )}

                {camp.isOwner && (
                  <YawmakButton variant="outline" size="sm" onClick={() => toggleStatus(camp)}>
                    {camp.status === "active" ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  </YawmakButton>
                )}
              </div>
            </div>
          </YawmakCard>
        ))}
      </div>

      {/* Create Campaign Modal */}
      <YawmakDialog open={createOpen} onClose={() => setCreateOpen(false)} title="إنشاء حملة جديدة">
        <form onSubmit={handleCreate} className="space-y-4">
          <YawmakInput
            label="عنوان الحملة"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="مثال: ختمة جماعية لذكرى عزيز"
          />
          <YawmakTextarea
            label="وصف الحملة وتوزيع المهام"
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <div className="grid grid-cols-2 gap-3">
            <YawmakInput
              label="الهدف العددي"
              type="number"
              min={1}
              value={goalTarget}
              onChange={(e) => setGoalTarget(Number(e.target.value))}
            />
            <YawmakInput
              label="وحدة القياس"
              value={unitLabel}
              onChange={(e) => setUnitLabel(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium">التصنيف</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full h-11 px-3 rounded-xl bg-[var(--yawmak-bg-elevated)] border border-[var(--yawmak-border-subtle)] text-sm"
              >
                <option value="khatma">ختمة قرآن</option>
                <option value="adhkar">أذكار</option>
                <option value="charity">عمل خيري</option>
                <option value="dua">دعاء</option>
                <option value="education">علم نافع</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium">الخصوصية</label>
              <select
                value={visibility}
                onChange={(e) => setVisibility(e.target.value as "public" | "private")}
                className="w-full h-11 px-3 rounded-xl bg-[var(--yawmak-bg-elevated)] border border-[var(--yawmak-border-subtle)] text-sm"
              >
                <option value="public">عامة</option>
                <option value="private">خاصة (PRO / VIP)</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <YawmakButton type="button" variant="ghost" onClick={() => setCreateOpen(false)}>
              إلغاء
            </YawmakButton>
            <YawmakButton type="submit" variant="primary" loading={saving}>
              إطلاق الحملة
            </YawmakButton>
          </div>
        </form>
      </YawmakDialog>
    </div>
  );
}
