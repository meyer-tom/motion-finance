import { redirect } from "next/navigation"
import { getAuthSession } from "@/lib/auth/session"
import { OnboardingStepper } from "./_components/onboarding-stepper"

export default async function OnboardingPage() {
  const session = await getAuthSession()

  if (!session) {
    redirect("/login")
  }

  return <OnboardingStepper firstName={session.user.firstName} />
}
