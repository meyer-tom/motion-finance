"use client"

import { motion } from "framer-motion"
import type { ReactNode } from "react"

export function PageTransition({ children }: { readonly children: ReactNode }) {
  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      initial={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  )
}
