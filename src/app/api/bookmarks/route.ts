import { NextResponse } from "next/server";
import { db } from "@/db";
import { bookmarks } from "@/db/schema";
import { and, desc, eq } from "drizzle-orm";
import { requireUser, AuthError } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const user = await requireUser();
    const { searchParams } = new URL(req.url);
    const itemType = searchParams.get("type");

    const list = itemType
      ? await db
          .select()
          .from(bookmarks)
          .where(and(eq(bookmarks.userId, user.id), eq(bookmarks.itemType, itemType)))
          .orderBy(desc(bookmarks.createdAt))
          .limit(100)
      : await db
          .select()
          .from(bookmarks)
          .where(eq(bookmarks.userId, user.id))
          .orderBy(desc(bookmarks.createdAt))
          .limit(100);

    return NextResponse.json({ bookmarks: list });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    return NextResponse.json({ error: "تعذر جلب المفضلة" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireUser();
    const body = await req.json().catch(() => null);
    const itemType = typeof body?.itemType === "string" ? body.itemType.trim() : "";
    const itemKey = typeof body?.itemKey === "string" ? body.itemKey.trim().slice(0, 100) : "";
    const title = typeof body?.title === "string" ? body.title.trim().slice(0, 180) : "";
    const subtitle = typeof body?.subtitle === "string" ? body.subtitle.trim().slice(0, 300) : null;
    const note = typeof body?.note === "string" ? body.note.trim().slice(0, 1000) : null;

    if (!["quran", "adhkar", "dua", "invitation", "campaign"].includes(itemType) || !itemKey || !title) {
      return NextResponse.json({ error: "بيانات العلامة المرجعية غير مكتملة" }, { status: 400 });
    }

    await db
      .insert(bookmarks)
      .values({ userId: user.id, itemType, itemKey, title, subtitle, note })
      .onConflictDoUpdate({
        target: [bookmarks.userId, bookmarks.itemType, bookmarks.itemKey],
        set: { title, subtitle, note },
      });

    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    return NextResponse.json({ error: "تعذر حفظ المفضلة" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const user = await requireUser();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const itemType = searchParams.get("itemType");
    const itemKey = searchParams.get("itemKey");

    if (id) {
      await db.delete(bookmarks).where(and(eq(bookmarks.id, id), eq(bookmarks.userId, user.id)));
      return NextResponse.json({ ok: true });
    }
    if (itemType && itemKey) {
      await db
        .delete(bookmarks)
        .where(
          and(
            eq(bookmarks.userId, user.id),
            eq(bookmarks.itemType, itemType),
            eq(bookmarks.itemKey, itemKey)
          )
        );
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: "يرجى تحديد العنصر للحذف" }, { status: 400 });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    return NextResponse.json({ error: "تعذر إزالة المفضلة" }, { status: 500 });
  }
}
