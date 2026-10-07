import { apiFetch } from "@/lib/api/client"
import type { LoginDto, LoginResponse, RegisterDto, Usuario } from "@/lib/api/types"

export async function login(dto: LoginDto): Promise<LoginResponse> {
  const result = await apiFetch<LoginResponse>("/auth/login", {
    method: "POST",
    body: dto,
  })
  if (!result) throw new Error("Login falló: respuesta vacía del backend")
  return result
}

export async function register(dto: RegisterDto): Promise<Usuario> {
  const result = await apiFetch<Usuario>("/auth/register", {
    method: "POST",
    body: dto,
  })
  if (!result) throw new Error("Registro falló: respuesta vacía del backend")
  return result
}
