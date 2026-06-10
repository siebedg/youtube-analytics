import Link from "next/link"
import { notFound } from "next/navigation"
import { Dashboard } from "@/components/dashboard"
import { ThemeToggle } from "@/components/theme-toggle"
import { USERS, parseUserSlug, displayName } from "@/lib/users"

type PageProps = {
  params: Promise<{ user: string }>
}

export default async function UserPage({ params }: PageProps) {
  const { user } = await params
  const userId = parseUserSlug(user)
  if (!userId) notFound()

  return (
    <main className="min-h-screen bg-background px-4 py-8 md:px-8 md:py-12">
      <div className="mx-auto w-full max-w-5xl">
        <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Creator Analytics</p>
            <h1 className="text-balance text-3xl font-bold tracking-tight md:text-4xl">
              {displayName(userId)}
            </h1>
            <p className="mt-2 max-w-2xl text-pretty leading-relaxed text-muted-foreground">
              YouTube video performance — channels and videos for this workspace only.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <nav className="flex gap-1 rounded-lg border border-border p-1">
              {USERS.map((slug) => (
                <Link
                  key={slug}
                  href={`/${slug}`}
                  className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                    slug === userId
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {displayName(slug)}
                </Link>
              ))}
            </nav>
            <ThemeToggle />
          </div>
        </header>

        <Dashboard userId={userId} />
      </div>
    </main>
  )
}
