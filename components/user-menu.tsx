import { clearSession } from "@/lib/session"
import { redirect } from "next/navigation"
import { LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"

type UserMenuProps = {
  name: string
}

async function signOut() {
  "use server"
  await clearSession()
  redirect("/login")
}

export function UserMenu({ name }: UserMenuProps) {
  return (
    <div className="flex items-center gap-3">
      <p className="hidden text-sm font-medium sm:block">{name}</p>
      <form action={signOut}>
        <Button type="submit" variant="outline" size="sm" className="gap-1.5">
          <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
          Sign out
        </Button>
      </form>
    </div>
  )
}
