import { getOnboardingProgress } from "@/lib/actions/onboarding"
import { OnboardingChecklist } from "./onboarding-checklist"

const TOTAL_STEPS = 7

export async function OnboardingChecklistSection() {
  const { checklistCompleted } = await getOnboardingProgress()
  if (checklistCompleted.length >= TOTAL_STEPS) {
    return null
  }
  return <OnboardingChecklist completedSteps={checklistCompleted} />
}
