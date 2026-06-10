import { createSession } from "@/lib/session"
import { verifyPasskey, PASSKEY_USERS, displayName } from "@/lib/passkeys"
import { getSession } from "@/lib/session"
import { redirect } from "next/navigation"
import { BarChart3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type LoginPageProps = {
  searchParams: Promise<{ error?: string }>
}

async function loginWithPasskey(formData: FormData) {
  "use server"

  const user = verifyPasskey(formData.get("passkey") as string)
  if (!user) redirect("/login?error=1")

  await createSession(user)
  redirect("/")
}

async function loginAsUser(formData: FormData) {
  "use server"

  const user = verifyPasskey(formData.get("user") as string)
  if (!user) redirect("/login?error=1")

  await createSession(user)
  redirect("/")
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const session = await getSession()
  if (session) redirect("/")

  const { error } = await searchParams

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <BarChart3 className="h-6 w-6" aria-hidden="true" />
          </div>
          <CardTitle className="text-2xl">YouTube Analytics</CardTitle>
          <CardDescription>Pick your account or enter your passkey.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-3">
            {PASSKEY_USERS.map((user) => (
              <form key={user} action={loginAsUser}>
                <input type="hidden" name="user" value={user} />
                <Button type="submit" variant="outline" className="w-full">
                  {displayName(user)}
                </Button>
              </form>
            ))}
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">or type passkey</span>
            </div>
          </div>

          <form action={loginWithPasskey} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="passkey">Passkey</Label>
              <Input
                id="passkey"
                name="passkey"
                placeholder="zenex or jojoh"
                autoComplete="off"
                required
              />
            </div>
            {error ? (
              <p className="text-sm text-destructive">Unknown passkey. Use zenex or jojoh.</p>
            ) : null}
            <Button type="submit" className="w-full">
              Continue
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  )
}
