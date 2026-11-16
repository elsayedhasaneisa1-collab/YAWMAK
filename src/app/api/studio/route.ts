import { NextResponse } from "next/server";
import { db } from "@/db";
import { studioProjects } from "@/db/schema";
import { and, desc, eq } from "drizzle-orm";
import { requireUser, AuthError } from "@/lib/auth";

export async function GET() {
  try {
    const user = await requireUser();
    const list = await db
      .select()
      .from(studioProjects)
      .where(eq(studioProjects.userId, user.id))
      .orderBy(desc(studioProjects.updatedAt))
      .limit(30);
    return NextResponse.json({ projects: list });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    return NextResponse.json({ error: "تعذر تحميل مشاريع الاستوديو" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireUser();
    const body = await req.json().catch(() => null);
    const title = typeof body?.title === "string" ? body.title.trim().slice(0, 100) : "تصميم جديد";
    const category = typeof body?.category === "string" ? body.category.trim().slice(0, 40) : "card";
    const designJson = body?.designJson && typeof body.designJson === "object" ? body.designJson : null;

    if (!designJson) {
      return NextResponse.json({ error: "بيانات التصميم مطلوبة" }, { status: 400 });
    }

    if (typeof body?.id === "string" && body.id) {
      const [updated] = await db
        .update(studioProjects)
        .set({ title, category, designJson, updatedAt: new Date() })
        .where(and(eq(studioProjects.id, body.id), eq(studioProjects.userId, user.id)))
        .returning();
      if (updated) return NextResponse.json({ project: updated });
    }

    const [created] = await db
      .insert(studioProjects)
      .values({ userId: user.id, title, category, designJson })
      .returning();

    return NextResponse.json({ project: created }, { status: 201 });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    return NextResponse.json({ error: "تعذر حفظ المشروع" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const user = await requireUser();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "المعرف مطلوب" }, { status: 400 });
    await db
      .delete(studioProjects)
      .where(and(eq(studioProjects.id, id), eq(studioProjects.userId, user.id)));
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    return NextResponse.json({ error: "تعذر حذف المشروع" }, { status: 500 });
  }
}
