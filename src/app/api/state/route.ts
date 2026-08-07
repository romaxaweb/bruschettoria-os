import { NextResponse } from "next/server"

import { createSupabaseAdmin } from "@/lib/supabase/admin"

export const dynamic = "force-dynamic"

const STATE_ID = "main"

export async function GET() {
  try {
    const supabase = createSupabaseAdmin()

    const { data, error } = await supabase
      .from("bruschettoria_state")
      .select("data, updated_at")
      .eq("id", STATE_ID)
      .maybeSingle()

    if (error) {
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      ok: true,
      data: data?.data ?? null,
      updatedAt: data?.updated_at ?? null,
    })
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Unknown server error",
      },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const state = body?.data

    if (
      !state ||
      typeof state !== "object" ||
      Array.isArray(state)
    ) {
      return NextResponse.json(
        { ok: false, error: "Invalid state payload" },
        { status: 400 }
      )
    }

    const supabase = createSupabaseAdmin()
    const updatedAt = new Date().toISOString()

    const { error } = await supabase
      .from("bruschettoria_state")
      .upsert(
        {
          id: STATE_ID,
          data: state,
          updated_at: updatedAt,
        },
        {
          onConflict: "id",
        }
      )

    if (error) {
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      ok: true,
      updatedAt,
    })
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Unknown server error",
      },
      { status: 500 }
    )
  }
}
