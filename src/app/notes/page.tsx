import React from "react";
import type { Metadata } from "next";
import NotesView from "@/components/yawmak/NotesView";

export const metadata: Metadata = {
  title: "ملاحظاتي",
  description: "اكتب ملاحظاتك واحفظها على جهازك مع حفظ تلقائي.",
};

export default function NotesPage() {
  return <NotesView />;
}
