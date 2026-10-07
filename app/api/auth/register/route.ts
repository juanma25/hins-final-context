import { NextResponse } from "next/server"
import { register } from "@/lib/api/auth"
import type { RegisterDto } from "@/lib/api/types"

export async function POST(request: Request) {
  const body = (await request.json()) as RegisterDto

  try {
    const usuario = await register(body)
    return NextResponse.json(usuario, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Error al registrar usuario" },
      { status: 409 }
    )
  }
}
