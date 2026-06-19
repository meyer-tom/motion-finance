"use client"

import { motion } from "framer-motion"
import type { ReactNode } from "react"

const container = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.05,
    },
  },
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 300, damping: 30 },
  },
}

export function LandingAnimations({
  children,
}: {
  readonly children: ReactNode
}) {
  const nodes = Array.isArray(children) ? children : [children]
  return (
    <motion.div animate="show" initial="hidden" variants={container}>
      {nodes.map((child, i) => (
        <motion.div key={i} variants={item}>
          {child}
        </motion.div>
      ))}
    </motion.div>
  )
}
