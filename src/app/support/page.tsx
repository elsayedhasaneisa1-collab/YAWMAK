"use client";

import React, { useEffect, useState } from "react";
import {
  Headphones,
  MessageCircle,
  Mail,
  Send,
  ChevronDown,
  Users,
  Shield,
  CheckCircle2,
} from "@/components/ui/icons";
import {
  YawmakCard,
  YawmakInput,
  YawmakTextarea,
  YawmakButton,
  YawmakBadge,
} from "@/components/ui/DesignSystem";
import { useYawmak } from "@/components/providers/YawmakProvider";
import { formatWhatsAppIntlUrl } from "@/lib/constants";

interface FaqItem {
  q: string;
  a: string;
}

interface TicketItem {
  id: string;
  category: string;
  subject: string;
  message: string;
  status: string;
  adminReply: string | null;
  createdAt: string;
}

export default function SupportPage() {
  const { user, supportContacts, toast } = useYawmak();
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [myTickets, setMyTickets] = useState<TicketItem[]>([]);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const [contactInfo, setContactInfo] = useState("");
  const [category, setCategory] = useState("support");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const loadData = () => {
    fetch("/api/support")
      .then((r) => r.json())
      .then((d) => {
        setFaqs(d.faqs || []);
        setMyTickets(d.myTickets || []);
      })
      .catch(() => undefined);
  };

  useEffect(() => {
    loadData();
    const sync = window.setTimeout(() => {
      const params = new URLSearchParams(window.location.search);
      const cat = params.get("category");
      if (cat && ["support", "issue", "privacy", "appeal", "other"].includes(cat)) {
        setCategory(cat);
      }
    }, 0);
    return () => window.clearTimeout(sync);
  }, []);

  useEffect(() => {
    const sync = window.setTimeout(() => {
      if (user && !contactInfo) {
        setContactInfo(user.email || user.phone);
      }
    }, 0);
    return () => window.clearTimeout(sync);
  }, [user, contactInfo]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contactInfo, category, subject, message }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast({ type: "error", title: data.error || "تعذر إرسال الطلب" });
      } else {
        toast({ type: "success", title: "تم استلام تذكرة الدعم", message: data.message });
        setSubject("");
        setMessage("");
        loadData();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-10">
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <YawmakBadge tone="gold">
          <Headphones className="w-3.5 h-3.5" /> مركز الدعم والتواصل الرسمي
        </YawmakBadge>
        <h1 className="font-display text-3xl sm:text-4xl font-bold yawmak-gold-text">
          نحن هنا لخدمتك
        </h1>
        <p className="text-sm text-[var(--yawmak-text-muted)]">
          تواصل معنا مباشرة عبر القنوات الرسمية أو افتح تذكرة دعم أو بلاغ خصوصية لمتابعته من فريق يومك.
        </p>
      </div>

      {/* Official Contact Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <YawmakCard className="space-y-3">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
            <MessageCircle className="w-5 h-5" /> واتساب الدعم الرسمي
          </div>
          <div className="space-y-2 text-xs">
            <a
              href={formatWhatsAppIntlUrl(supportContacts.whatsappPrimary)}
              target="_blank"
              rel="noopener noreferrer"
              className="block p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 hover:bg-emerald-500/20 font-mono"
            >
              الأساسي: {supportContacts.whatsappPrimary}
            </a>
            <a
              href={formatWhatsAppIntlUrl(supportContacts.whatsappSecondary)}
              target="_blank"
              rel="noopener noreferrer"
              className="block p-2.5 rounded-xl bg-white/5 border border-[var(--yawmak-border-subtle)] hover:border-emerald-500/40 font-mono"
            >
              الإضافي: {supportContacts.whatsappSecondary}
            </a>
          </div>
        </YawmakCard>

        <YawmakCard className="space-y-3">
          <div className="flex items-center gap-2 text-[var(--yawmak-gold)] font-bold text-sm">
            <Mail className="w-5 h-5" /> البريد والمنصات الاجتماعية
          </div>
          <a
            href={`mailto:${supportContacts.email}`}
            className="block text-xs font-mono text-[var(--yawmak-gold-soft)] break-all hover:underline"
          >
            {supportContacts.email}
          </a>
          <div className="flex flex-wrap gap-2 pt-1 text-xs">
            <a href={supportContacts.telegramUrl} target="_blank" rel="noopener noreferrer" className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 hover:border-[var(--yawmak-gold)]/50">
              تيليجرام ({supportContacts.telegram})
            </a>
            <a href={supportContacts.facebook} target="_blank" rel="noopener noreferrer" className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 hover:border-[var(--yawmak-gold)]/50">
              فيسبوك
            </a>
            <a href={supportContacts.instagram} target="_blank" rel="noopener noreferrer" className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 hover:border-[var(--yawmak-gold)]/50">
              إنستغرام
            </a>
            <a href={supportContacts.tiktok} target="_blank" rel="noopener noreferrer" className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 hover:border-[var(--yawmak-gold)]/50">
              تيك توك
            </a>
          </div>
        </YawmakCard>

        <YawmakCard glow className="space-y-3 flex flex-col justify-between bg-gradient-to-br from-[#FAF3E3]/90 to-transparent">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-emerald-300 font-bold text-sm">
              <Users className="w-5 h-5" /> مجتمع YAWMAK على واتساب
            </div>
            <p className="text-xs text-[var(--yawmak-text-muted)] leading-relaxed">
              انضم إلى مجتمعنا الرسمي لتصلك التحديثات والحملات الجماعية والأذكار اليومية.
            </p>
          </div>
          <a href={supportContacts.whatsappCommunity} target="_blank" rel="noopener noreferrer">
            <YawmakButton variant="primary" size="sm" className="w-full">
              انضم إلى مجتمعنا على واتساب
            </YawmakButton>
          </a>
        </YawmakCard>
      </div>

      {/* Ticket Form + FAQ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6">
          <YawmakCard className="space-y-4">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Shield className="w-5 h-5 text-[var(--yawmak-gold)]" />
              فتح تذكرة دعم أو بلاغ خصوصية
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-sm font-medium">نوع الطلب</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full h-11 px-3 rounded-xl bg-[var(--yawmak-bg-elevated)] border border-[var(--yawmak-border-subtle)] text-sm"
                >
                  <option value="support">دعم فني واستفسار عام</option>
                  <option value="issue">الإبلاغ عن مشكلة تقنية</option>
                  <option value="privacy">بلاغ انتهاك خصوصية (أولوية عالية)</option>
                  <option value="appeal">اعتراض على تعليق أو حظر حساب</option>
                  <option value="other">أخرى</option>
                </select>
              </div>
              <YawmakInput
                label="وسيلة التواصل (بريد أو هاتف)"
                required
                value={contactInfo}
                onChange={(e) => setContactInfo(e.target.value)}
                placeholder="010xxxxxxxx أو بريدك الإلكتروني"
              />
              <YawmakInput
                label="عنوان الطلب"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="ملخص واضح للمشكلة أو الاستفسار"
              />
              <YawmakTextarea
                label="التفاصيل"
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="اشرح التفاصيل بوضوح ليتمكن فريق يومك من مساعدتك سريعًا..."
              />
              <YawmakButton type="submit" variant="primary" loading={loading} className="w-full">
                <Send className="w-4 h-4" /> إرسال التذكرة
              </YawmakButton>
            </form>
          </YawmakCard>
        </div>

        <div className="lg:col-span-6 space-y-6" id="faq">
          <YawmakCard className="space-y-3">
            <h2 className="text-lg font-bold">الأسئلة الشائعة (FAQ)</h2>
            <div className="space-y-2">
              {faqs.map((item, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-[var(--yawmak-border-subtle)] bg-white/[0.02] overflow-hidden"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                    className="w-full flex items-center justify-between gap-2 p-3.5 text-right text-sm font-semibold cursor-pointer"
                  >
                    <span>{item.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-[var(--yawmak-gold)] shrink-0 transition-transform ${
                        openFaq === idx ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {openFaq === idx && (
                    <div className="px-3.5 pb-3.5 text-xs text-[var(--yawmak-text-muted)] leading-relaxed border-t border-[var(--yawmak-border-subtle)] pt-2.5">
                      {item.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </YawmakCard>

          {user && (
            <YawmakCard className="space-y-3">
              <h2 className="text-base font-bold">تذاكرك السابقة</h2>
              {myTickets.length === 0 ? (
                <p className="text-xs text-[var(--yawmak-text-muted)]">لم ترسل أي تذاكر دعم بعد.</p>
              ) : (
                <div className="space-y-2.5">
                  {myTickets.map((t) => (
                    <div
                      key={t.id}
                      className="p-3 rounded-xl bg-white/[0.03] border border-[var(--yawmak-border-subtle)] space-y-1.5"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-bold">{t.subject}</span>
                        <YawmakBadge tone={t.status === "resolved" ? "emerald" : "gold"}>
                          {t.status === "open" ? "مفتوحة" : t.status === "resolved" ? "تم الرد" : t.status}
                        </YawmakBadge>
                      </div>
                      <p className="text-xs text-[var(--yawmak-text-muted)]">{t.message}</p>
                      {t.adminReply && (
                        <div className="mt-2 p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/25 text-xs text-emerald-200 flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                          <span>
                            <strong>رد الإدارة:</strong> {t.adminReply}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </YawmakCard>
          )}
        </div>
      </div>
    </div>
  );
}
