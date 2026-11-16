import React from "react";
import type { Metadata } from "next";
import TasksView from "@/components/yawmak/TasksView";

export const metadata: Metadata = {
  title: "مهامي",
  description: "نظّم مهامك اليومية حسب الأولوية والموعد.",
};

export default function TasksPage() {
  return <TasksView />;
}
