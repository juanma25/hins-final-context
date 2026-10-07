import { cookies } from "next/headers"

export const SESSION_COOKIE_NAME = "hins_session"

export async function getToken(): Promise<string | undefined> {
  const store = await cookies()
  return store.get(SESSION_COOKIE_NAME)?.value
}

export async function clearSession(): Promise<void> {
  const store = await cookies()
  store.delete(SESSION_COOKIE_NAME)
}
