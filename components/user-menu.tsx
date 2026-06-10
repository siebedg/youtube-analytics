"use client"

import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"

type UserMenuProps = {
  email?: string | null
}

export function UserMenu({ email }: UserMenuProps) {
  const router = useRouter()

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/login")
    router.refresh()
  }

  return (
    <div className="flex items-center gap-3">
      {email ? (
        <p className="hidden text-sm text-muted-foreground sm:block">{email}</p>
      ) : null}
      <Button variant="outline" size="sm" onClick={handleSignOut} className="gap-1.5">
        <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
        Sign out
      </Button>
    </div>
  )
}
