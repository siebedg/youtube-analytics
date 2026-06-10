import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { headers } from "next/headers"
import { BarChart3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type SignupPageProps = {
  searchParams: Promise<{ error?: string }>
}

async function getSiteOrigin() {
  const headerStore = await headers()
  const host = headerStore.get("x-forwarded-host") ?? headerStore.get("host")
  const protocol = headerStore.get("x-forwarded-proto") ?? "http"
  if (host) return `${protocol}://${host}`
  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
}

async function signUp(formData: FormData) {
  "use server"

  const email = (formData.get("email") as string).trim().toLowerCase()
  const password = formData.get("password") as string
  const confirm = formData.get("confirm") as string

  if (password !== confirm) redirect("/signup?error=mismatch")

  const supabase = await createClient()
  const origin = await getSiteOrigin()
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
    },
  })

  if (error) redirect("/signup?error=1")

  if (data.user && data.user.identities?.length === 0) {
    redirect("/signup?error=exists")
  }

  if (!data.session) {
    redirect("/login?confirm=1")
  }

  redirect("/")
}

export default async function SignupPage({ searchParams }: SignupPageProps) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (user) redirect("/")

  const { error } = await searchParams
  const errorMessage =
    error === "mismatch"
      ? "Passwords do not match."
      : error === "exists"
        ? "An account with this email already exists. Try logging in."
        : error
          ? "Could not create account. Try a different email or a longer password."
          : null

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <BarChart3 className="h-6 w-6" aria-hidden="true" />
          </div>
          <CardTitle className="text-2xl">Create account</CardTitle>
          <CardDescription>
            Make your own account — your channels and videos stay separate from others.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={signUp} className="space-y-4">
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
                autoComplete="new-password"
                minLength={6}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm">Confirm password</Label>
              <Input
                id="confirm"
                name="confirm"
                type="password"
                autoComplete="new-password"
                minLength={6}
                required
              />
            </div>
            {errorMessage ? <p className="text-sm text-destructive">{errorMessage}</p> : null}
            <Button type="submit" className="w-full">
              Create account
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="text-primary underline-offset-4 hover:underline">
              Log in
            </Link>
          </p>
        </CardContent>
      </Card>
    </main>
  )
}
