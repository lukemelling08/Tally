export type ThemePreference = 'standard' | 'light' | 'dark'

const STORAGE_KEY = 'tally-theme'
const systemDark = window.matchMedia('(prefers-color-scheme: dark)')

export function getThemePreference(): ThemePreference {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'light' || stored === 'dark' || stored === 'standard') return stored
  } catch {
    // Storage can be unavailable (e.g. private browsing); fall back to standard
  }
  return 'standard'
}

// 'standard' follows the phone's own light/dark setting
function applyTheme(preference: ThemePreference) {
  const dark = preference === 'dark' || (preference === 'standard' && systemDark.matches)
  document.documentElement.dataset.theme = dark ? 'dark' : 'light'
}

export function setThemePreference(preference: ThemePreference) {
  try {
    localStorage.setItem(STORAGE_KEY, preference)
  } catch {
    // Still applies for this session
  }
  applyTheme(preference)
}

export function initTheme() {
  applyTheme(getThemePreference())
  systemDark.addEventListener('change', () => applyTheme(getThemePreference()))
}
