import { getDashboardData } from "@/lib/actions/dashboard"
import { ChartsClient } from "./charts-client"

interface Props {
  periodKey: string
}

export async function ChartsSection({ periodKey }: Props) {
  const data = await getDashboardData(periodKey)

  return (
    <ChartsClient
      categoryBreakdown={data.categoryBreakdown}
      chart={data.chart}
      periodKey={periodKey}
    />
  )
}
