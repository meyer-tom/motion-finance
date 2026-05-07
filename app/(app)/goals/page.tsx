import { Suspense } from "react"
import { getGoals } from "@/lib/actions/goals"
import { GoalListSkeleton } from "./_components/goal-skeletons"
import { GoalsClient } from "./_components/goals-client"

export default async function GoalsPage() {
  const goals = await getGoals()

  return (
    <Suspense fallback={<GoalListSkeleton />}>
      <GoalsClient initialGoals={goals} />
    </Suspense>
  )
}
