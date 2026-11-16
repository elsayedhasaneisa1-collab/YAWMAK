import React from "react";
import type { Metadata } from "next";
import FocusView from "@/components/yawmak/FocusView";

export const metadata: Metadata = {
  title: "التركيز",
  description: "مؤقت تركيز مع سجل جلسات وإحصائيات يومية.",
};

export default function FocusPage() {
  return <FocusView />;
}
