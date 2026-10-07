"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { login } from "@/lib/api/auth"
import { UnauthorizedError } from "@/lib/api/client"
import { SESSION_COOKIE_NAME } from "@/lib/api/session"

export interface LoginActionState {
  error?: string
}

export async function loginAction(_prevState: LoginActionState, formData: FormData): Promise<LoginActionState> {
  const email = String(formData.get("email") ?? "")
  const password = String(formData.get("password") ?? "")

  try {
    const { access_token } = await login({ email, password })
    const store = await cookies()
    store.set(SESSION_COOKIE_NAME, access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    })
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return { error: "Email o contraseña incorrectos" }
    }
    return { error: error instanceof Error ? error.message : "Error al iniciar sesión" }
  }

  redirect("/main")
}
