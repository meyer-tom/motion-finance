"use client"

import { motion } from "framer-motion"
import type { ReactNode } from "react"

const EASE_OUT = [0.16, 1, 0.3, 1] as const

interface FadeUpProps {
  readonly children: ReactNode
  readonly className?: string
  readonly delay?: number
}

/** Fade + translateY à l'entrée — pour les blocs hero. */
export function FadeUp({ children, className, delay = 0 }: FadeUpProps) {
  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      className={className}
      initial={{ opacity: 0, y: 16 }}
      transition={{ duration: 0.5, ease: EASE_OUT, delay }}
    >
      {children}
    </motion.div>
  )
}

interface RevealProps {
  readonly children: ReactNode
  readonly className?: string
  readonly delay?: number
}

/** Reveal au scroll — pour les sections plus bas dans la page. */
export function Reveal({ children, className, delay = 0 }: RevealProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 24 }}
      transition={{ duration: 0.5, ease: EASE_OUT, delay }}
      viewport={{ once: true, margin: "-80px" }}
      whileInView={{ opacity: 1, y: 0 }}
    >
      {children}
    </motion.div>
  )
}

interface StaggerGridProps {
  readonly children: ReactNode
  readonly className?: string
}

/** Grille avec stagger des enfants directs. */
export function StaggerGrid({ children, className }: StaggerGridProps) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      transition={{ staggerChildren: 0.06 }}
      viewport={{ once: true, margin: "-60px" }}
      whileInView="visible"
    >
      {children}
    </motion.div>
  )
}

interface StaggerItemProps {
  readonly children: ReactNode
  readonly className?: string
}

export function StaggerItem({ children, className }: StaggerItemProps) {
  return (
    <motion.div
      className={className}
      transition={{ duration: 0.45, ease: EASE_OUT }}
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
      }}
      whileHover={{ scale: 1.01 }}
    >
      {children}
    </motion.div>
  )
}
