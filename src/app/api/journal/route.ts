import { NextResponse } from "next/server";
import { db } from "@/db";
import { journalEntries, habits, goals } from "@/db/schema";
import { and, count, desc, eq } from "drizzle-orm";
import { requireUser, getPlanLimits, AuthError } from "@/lib/auth";
import { journalEntrySchema, habitCreateSchema, goalCreateSchema } from "@/lib/validation";

export async function GET() {
  try {
    const user = await requireUser();
    const [entries, userHabits, userGoals, plan] = await Promise.all([
      db
        .select()
        .from(journalEntries)
        .where(eq(journalEntries.userId, user.id))
        .orderBy(desc(journalEntries.createdAt))
        .limit(80),
      db
        .select()
        .from(habits)
        .where(eq(habits.userId, user.id))
        .orderBy(desc(habits.createdAt))
        .limit(100),
      db
        .select()
        .from(goals)
        .where(eq(goals.userId, user.id))
        .orderBy(desc(goals.createdAt))
        .limit(50),
      getPlanLimits(user.membershipPlan),
    ]);

    return NextResponse.json({
      entries,
      habits: userHabits,
      goals: userGoals,
      limits: {
        habitLimit: plan.habitLimit,
        currentHabits: userHabits.filter((h) => h.isActive).length,
      },
    });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    return NextResponse.json({ error: "تعذر تحميل بيانات الدفتر الشخصي" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireUser();
    const body = await req.json().catch(() => null);
    const kind = body?.kind || "entry";

    if (kind === "habit") {
      const parsed = habitCreateSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
      }

      // Server-enforced membership habit limit (FREE=3, PLUS=10, PRO=30, VIP=unlimited)
      const plan = await getPlanLimits(user.membershipPlan);
      if (plan.habitLimit !== -1) {
        const currentCount = await db
          .select({ total: count() })
          .from(habits)
          .where(and(eq(habits.userId, user.id), eq(habits.isActive, true)));
        const activeHabits = Number(currentCount[0]?.total || 0);
        if (activeHabits >= plan.habitLimit) {
          return NextResponse.json(
            {
              error: `لقد وصلت إلى الحد الأقصى للعادات في باقة ${user.membershipPlan} (${plan.habitLimit} عادات). يمكنك الترقية لزيادة الحد.`,
              limitReached: true,
            },
            { status: 403 }
          );
        }
      }

      const [created] = await db
        .insert(habits)
        .values({
          userId: user.id,
          title: parsed.data.title,
          category: parsed.data.category,
          targetCount: parsed.data.targetCount,
        })
        .returning();

      return NextResponse.json({ item: created }, { status: 201 });
    }

    if (kind === "goal") {
      const parsed = goalCreateSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
      }
      const [created] = await db
        .insert(goals)
        .values({
          userId: user.id,
          title: parsed.data.title,
          description: parsed.data.description,
          category: parsed.data.category,
          targetValue: parsed.data.targetValue,
          unit: parsed.data.unit,
          deadline: parsed.data.deadline || null,
        })
        .returning();
      return NextResponse.json({ item: created }, { status: 201 });
    }

    const parsed = journalEntrySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
    }

    const [created] = await db
      .insert(journalEntries)
      .values({
        userId: user.id,
        title: parsed.data.title,
        content: parsed.data.content,
        category: parsed.data.category,
        isFavorite: parsed.data.isFavorite,
        reminderAt: parsed.data.reminderAt ? new Date(parsed.data.reminderAt) : null,
      })
      .returning();

    return NextResponse.json({ item: created }, { status: 201 });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    return NextResponse.json({ error: "تعذر حفظ البيانات" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const user = await requireUser();
    const body = await req.json().catch(() => null);
    const kind = body?.kind || "entry";
    const id = typeof body?.id === "string" ? body.id : "";
    if (!id) return NextResponse.json({ error: "المعرف مطلوب" }, { status: 400 });

    if (kind === "habit") {
      const existing = await db
        .select()
        .from(habits)
        .where(and(eq(habits.id, id), eq(habits.userId, user.id)))
        .limit(1);
      if (!existing.length) return NextResponse.json({ error: "غير موجود" }, { status: 404 });

      const today = new Date().toISOString().slice(0, 10);
      const h = existing[0];
      if (body.completeToday) {
        if (h.lastCompletedDate === today) {
          return NextResponse.json({ item: h, alreadyDone: true });
        }
        const [updated] = await db
          .update(habits)
          .set({
            currentStreak: h.currentStreak + 1,
            totalCompletions: h.totalCompletions + 1,
            lastCompletedDate: today,
          })
          .where(and(eq(habits.id, id), eq(habits.userId, user.id)))
          .returning();
        return NextResponse.json({ item: updated });
      }
      return NextResponse.json({ item: h });
    }

    if (kind === "goal") {
      const existing = await db
        .select()
        .from(goals)
        .where(and(eq(goals.id, id), eq(goals.userId, user.id)))
        .limit(1);
      if (!existing.length) return NextResponse.json({ error: "غير موجود" }, { status: 404 });
      const currentValue = Math.max(0, Number(body.currentValue ?? existing[0].currentValue));
      const status = currentValue >= existing[0].targetValue ? "completed" : "active";
      const [updated] = await db
        .update(goals)
        .set({ currentValue, status })
        .where(and(eq(goals.id, id), eq(goals.userId, user.id)))
        .returning();
      return NextResponse.json({ item: updated });
    }

    const updates: Record<string, unknown> = { updatedAt: new Date() };
    if (typeof body.title === "string") updates.title = body.title.trim().slice(0, 140);
    if (typeof body.content === "string") updates.content = body.content.trim().slice(0, 8000);
    if (typeof body.isFavorite === "boolean") updates.isFavorite = body.isFavorite;
    if (typeof body.isArchived === "boolean") updates.isArchived = body.isArchived;

    const [updated] = await db
      .update(journalEntries)
      .set(updates)
      .where(and(eq(journalEntries.id, id), eq(journalEntries.userId, user.id)))
      .returning();

    return NextResponse.json({ item: updated });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    return NextResponse.json({ error: "تعذر التحديث" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const user = await requireUser();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const kind = searchParams.get("kind") || "entry";
    if (!id) return NextResponse.json({ error: "المعرف مطلوب" }, { status: 400 });

    if (kind === "habit") {
      await db.delete(habits).where(and(eq(habits.id, id), eq(habits.userId, user.id)));
    } else if (kind === "goal") {
      await db.delete(goals).where(and(eq(goals.id, id), eq(goals.userId, user.id)));
    } else {
      await db.delete(journalEntries).where(and(eq(journalEntries.id, id), eq(journalEntries.userId, user.id)));
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    return NextResponse.json({ error: "تعذر الحذف" }, { status: 500 });
  }
}
