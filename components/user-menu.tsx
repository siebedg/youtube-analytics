"use client"

import { signOut } from "next-auth/react"
import Image from "next/image"
import { LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"

type UserMenuProps = {
  name?: string | null
  email?: string | null
  image?: string | null
}

export function UserMenu({ name, email, image }: UserMenuProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="hidden text-right sm:block">
        <p className="text-sm font-medium leading-none">{name ?? "User"}</p>
        {email ? <p className="text-xs text-muted-foreground">{email}</p> : null}
      </div>
      {image ? (
        <Image
          src={image}
          alt=""
          width={32}
          height={32}
          className="rounded-full"
          unoptimized
        />
      ) : null}
      <Button
        variant="outline"
        size="sm"
        onClick={() => signOut({ callbackUrl: "/login" })}
        className="gap-1.5"
      >
        <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
        Sign out
      </Button>
    </div>
  )
}
