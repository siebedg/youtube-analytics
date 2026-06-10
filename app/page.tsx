import { auth } from "@/lib/auth"
import { Dashboard } from "@/components/dashboard"
import { ThemeToggle } from "@/components/theme-toggle"
import { UserMenu } from "@/components/user-menu"

export default async function Page() {
  const session = await auth()

  return (
    <main className="min-h-screen bg-background px-4 py-8 md:px-8 md:py-12">
      <div className="mx-auto w-full max-w-5xl">
        <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Creator Analytics</p>
            <h1 className="text-balance text-3xl font-bold tracking-tight md:text-4xl">
              YouTube Video Performance Comparison
            </h1>
            <p className="mt-2 max-w-2xl text-pretty leading-relaxed text-muted-foreground">
              Compare how each video performed across reach, thumbnail effectiveness, retention, and
              watch time. Manage multiple channels, edit existing data, and compare channels side by side.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            {session?.user ? (
              <UserMenu
                name={session.user.name}
                email={session.user.email}
                image={session.user.image}
              />
            ) : null}
          </div>
        </header>

        <Dashboard />
      </div>
    </main>
  )
}
