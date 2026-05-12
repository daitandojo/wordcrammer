/**
 * Haptic feedback for mobile devices.
 * Falls back silently if not supported.
 */

export function hapticLight() {
  try { navigator.vibrate(5) } catch { /* haptic not supported */ }
}

export function hapticMedium() {
  try { navigator.vibrate(10) } catch { /* haptic not supported */ }
}

export function hapticHeavy() {
  try { navigator.vibrate([10, 20, 10]) } catch { /* haptic not supported */ }
}

export function hapticSuccess() {
  try { navigator.vibrate([5, 30, 8]) } catch { /* haptic not supported */ }
}

export function hapticError() {
  try { navigator.vibrate([10, 40, 15]) } catch { /* haptic not supported */ }
}

export function hapticLevelUp() {
  try { navigator.vibrate([20, 50, 20, 50, 30]) } catch { /* haptic not supported */ }
}
