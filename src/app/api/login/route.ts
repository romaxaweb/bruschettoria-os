import { NextResponse } from "next/server"

export async function POST(request: Request) {
  const body = await request.json()
  const password = body?.password

  const expected = process.env.APP_PASSWORD

  if (!expected) {
    return NextResponse.json(
      {
        ok: false,
        error: "APP_PASSWORD is not configured",
      },
      {
        status: 500,
      }
    )
  }

  if (password !== expected) {
    return NextResponse.json(
      {
        ok: false,
        error: "Invalid password",
      },
      {
        status: 401,
      }
    )
  }

  const response = NextResponse.json({
    ok: true,
  })

  response.cookies.set(
    "bruschettoria_session",
    expected,
    {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    }
  )

  return response
}
