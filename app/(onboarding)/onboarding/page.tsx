import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { OnboardingStepper } from "./_components/onboarding-stepper"

export default async function OnboardingPage() {
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session) {
    redirect("/login")
  }

  return <OnboardingStepper firstName={session.user.firstName} />
}
