"use client";

import React, { useRef, useState } from "react";
import { Database, Download, Trash2, Upload } from "@/components/ui/icons";
import {
  YawmakButton,
  YawmakCard,
  YawmakDialog,
} from "@/components/ui/DesignSystem";
import { clearAllData, exportBackup, importBackup } from "@/lib/localdb";
import { useStorageMode } from "@/lib/useYawmakData";

export default function LocalDataPanel() {
  const storageMode = useStorageMode();
  const fileRef = useRef<HTMLInputElement>(null);
  const [clearOpen, setClearOpen] = useState(false);
  const [message, setMessage] = useState("");

  const handleExport = async () => {
    const backup = await exportBackup();
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `yawmak-backup-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    setMessage("تم تصدير النسخة الاحتياطية");
  };

  const handleImport = async (file: File) => {
    const text = await file.text();
    const result = await importBackup(text);
    if (result.error) {
      setMessage(result.error);
      return;
    }
    setMessage(`تم الاستيراد: ${result.tasks} مهمة، ${result.notes} ملاحظة، ${result.sessions} جلسة`);
    window.setTimeout(() => window.location.reload(), 900);
  };

  const handleClear = async () => {
    await clearAllData();
    setClearOpen(false);
    setMessage("تم حذف جميع البيانات المحلية");
    window.setTimeout(() => window.location.reload(), 900);
  };

  return (
    <YawmakCard className="space-y-4">
      <div className="flex items-center gap-2.5">
        <div className="w-10 h-10 rounded-xl bg-[var(--yawmak-primary-tint)] flex items-center justify-center text-[var(--yawmak-primary)]">
          <Database className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-base font-bold text-[var(--yawmak-text)]">بياناتك المحلية</h2>
          <p className="text-xs text-[var(--yawmak-text-muted)]">
            {storageMode === "indexeddb"
              ? "محفوظة على جهازك عبر IndexedDB"
              : "التخزين الدائم غير متاح حاليًا، تُحفظ البيانات في الذاكرة المؤقتة"}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <YawmakButton variant="secondary" onClick={handleExport}>
          <Download className="w-4 h-4" /> تصدير نسخة احتياطية
        </YawmakButton>
        <YawmakButton variant="outline" onClick={() => fileRef.current?.click()}>
          <Upload className="w-4 h-4" /> استيراد نسخة
        </YawmakButton>
        <YawmakButton variant="danger" onClick={() => setClearOpen(true)}>
          <Trash2 className="w-4 h-4" /> حذف جميع البيانات
        </YawmakButton>
        <input
          ref={fileRef}
          type="file"
          accept="application/json"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void handleImport(file);
            e.target.value = "";
          }}
        />
      </div>

      {message && <p className="text-xs text-[var(--yawmak-primary)]">{message}</p>}

      <YawmakDialog
        open={clearOpen}
        onClose={() => setClearOpen(false)}
        title="حذف جميع البيانات المحلية"
        description="سيتم حذف المهام والملاحظات وسجل جلسات التركيز من هذا الجهاز نهائيًا."
        tone="danger"
        footer={
          <>
            <YawmakButton variant="ghost" size="sm" onClick={() => setClearOpen(false)}>
              إلغاء
            </YawmakButton>
            <YawmakButton variant="danger" size="sm" onClick={handleClear}>
              حذف نهائي
            </YawmakButton>
          </>
        }
      />
    </YawmakCard>
  );
}
