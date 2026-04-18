// Web stub — SMS reading is Android-only.
// The manual payment button in ListeningDashboardScreen
// is used instead during web demo mode.
export function startListening() {
  console.log('[PayGuard] SMS listening not available on web.');
  return { stop: () => {} };
}
