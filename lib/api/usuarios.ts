import { apiFetch } from "@/lib/api/client"
import type { UpdateUsuarioDto, Usuario, UsuarioMe } from "@/lib/api/types"

export async function listUsuarios(): Promise<Usuario[]> {
  const result = await apiFetch<Usuario[]>("/usuarios")
  return result ?? []
}

export async function getUsuario(id: string): Promise<Usuario | null> {
  return apiFetch<Usuario>(`/usuarios/${id}`)
}

export async function getMe(): Promise<UsuarioMe | null> {
  return apiFetch<UsuarioMe>("/usuarios/me")
}

export async function updateUsuario(id: string, dto: UpdateUsuarioDto): Promise<Usuario | null> {
  return apiFetch<Usuario>(`/usuarios/${id}`, { method: "PATCH", body: dto })
}

export async function deactivateUsuario(id: string): Promise<{ id: string; activo: false } | null> {
  return apiFetch<{ id: string; activo: false }>(`/usuarios/${id}`, { method: "DELETE" })
}
