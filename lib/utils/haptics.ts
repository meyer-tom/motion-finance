type HapticPattern = "tap" | "success" | "error" | "delete"

const patterns: Record<HapticPattern, VibratePattern> = {
  tap: 10,
  success: [40, 30, 40],
  error: [80, 40, 80],
  delete: [60, 20, 30],
}

function isVibrationSupported(): boolean {
  return typeof navigator !== "undefined" && "vibrate" in navigator
}

export function vibrate(pattern: HapticPattern | VibratePattern): void {
  if (!isVibrationSupported()) {
    return
  }

  const resolved = typeof pattern === "string" ? patterns[pattern] : pattern

  navigator.vibrate(resolved)
}
