import { NextResponse } from "next/server"
import { login } from "@/lib/api/auth"
import { UnauthorizedError } from "@/lib/api/client"
import { SESSION_COOKIE_NAME } from "@/lib/api/session"
import type { LoginDto } from "@/lib/api/types"

export async function POST(request: Request) {
  const body = (await request.json()) as LoginDto

  try {
    const { access_token } = await login(body)

    const response = NextResponse.json({ ok: true })
    response.cookies.set(SESSION_COOKIE_NAME, access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    })
    return response
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ message: error.message }, { status: 401 })
    }
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Error al iniciar sesión" },
      { status: 500 }
    )
  }
}
