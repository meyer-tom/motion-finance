"use client"

import dynamic from "next/dynamic"

export const BarChartDemo  = dynamic(() => import("./demo-charts").then((m) => m.BarChartDemo),  { ssr: false })
export const AreaChartDemo = dynamic(() => import("./demo-charts").then((m) => m.AreaChartDemo), { ssr: false })
export const PieChartDemo  = dynamic(() => import("./demo-charts").then((m) => m.PieChartDemo),  { ssr: false })
