import Link from "next/link"
import { USERS, displayName } from "@/lib/users"
import { ThemeToggle } from "@/components/theme-toggle"

export default function HomePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-8 text-center">
        <div>
          <p className="text-sm font-medium text-muted-foreground">YouTube Analytics</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">Pick a workspace</h1>
        </div>
        <div className="flex flex-col gap-3">
          {USERS.map((slug) => (
            <Link
              key={slug}
              href={`/${slug}`}
              className="rounded-xl border border-border bg-card px-6 py-4 text-lg font-semibold transition-colors hover:bg-accent"
            >
              {displayName(slug)}
            </Link>
          ))}
        </div>
        <div className="flex justify-center">
          <ThemeToggle />
        </div>
      </div>
    </main>
  )
}
