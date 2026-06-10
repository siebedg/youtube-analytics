export const PASSKEY_USERS = ["zenex", "jojoh"] as const

export type PasskeyUser = (typeof PASSKEY_USERS)[number]

export function verifyPasskey(input: string): PasskeyUser | null {
  const key = input.trim().toLowerCase()
  if (key === "zenex" || key === "jojoh") return key
  return null
}

export function displayName(userId: PasskeyUser) {
  return userId.charAt(0).toUpperCase() + userId.slice(1)
}
