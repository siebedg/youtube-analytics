import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { BarChart3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type LoginPageProps = {
  searchParams: Promise<{ error?: string; confirm?: string }>
}

async function signIn(formData: FormData) {
  "use server"

  const email = (formData.get("email") as string).trim().toLowerCase()
  const password = formData.get("password") as string

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    const message = error.message.toLowerCase()
    if (message.includes("email not confirmed") || error.code === "email_not_confirmed") {
      redirect("/login?error=confirm")
    }
    redirect("/login?error=1")
  }

  redirect("/")
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (user) redirect("/")

  const { error, confirm } = await searchParams

  const statusMessage = confirm
    ? "Account created. Check your email for a confirmation link, then log in."
    : error === "confirm"
      ? "Confirm your email first — check your inbox (and spam)."
      : error
        ? "Invalid email or password."
        : null

  const statusIsError = !confirm && !!error

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <BarChart3 className="h-6 w-6" aria-hidden="true" />
          </div>
          <CardTitle className="text-2xl">YouTube Analytics</CardTitle>
          <CardDescription>Log in with your account.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={signIn} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" autoComplete="email" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
              />
            </div>
            {statusMessage ? (
              <p className={`text-sm ${statusIsError ? "text-destructive" : "text-muted-foreground"}`}>
                {statusMessage}
              </p>
            ) : null}
            <Button type="submit" className="w-full">
              Log in
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            No account yet?{" "}
            <Link href="/signup" className="text-primary underline-offset-4 hover:underline">
              Create one
            </Link>
          </p>
        </CardContent>
      </Card>
    </main>
  )
}
