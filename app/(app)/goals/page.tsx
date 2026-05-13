import { Suspense } from "react"
import { getGoals } from "@/lib/actions/goals"
import { getChecklistState } from "@/lib/actions/onboarding"
import { GoalListSkeleton } from "./_components/goal-skeletons"
import { GoalsClient } from "./_components/goals-client"

export default async function GoalsPage() {
  const [goals, checklistState] = await Promise.all([
    getGoals(),
    getChecklistState(),
  ])

  return (
    <Suspense fallback={<GoalListSkeleton />}>
      <GoalsClient
        checklistCompleted={checklistState.checklistCompleted}
        checklistDismissed={checklistState.checklistDismissed}
        initialGoals={goals}
        tooltipsSeen={checklistState.tooltipsSeen}
      />
    </Suspense>
  )
}
