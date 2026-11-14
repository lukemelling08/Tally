import { useState } from 'react'
import { getThemePreference, setThemePreference, type ThemePreference } from '../theme'
import './SettingsPage.css'

const STYLE_OPTIONS: { value: ThemePreference; label: string; hint: string }[] = [
  { value: 'standard', label: 'Standard', hint: "Matches your phone's setting" },
  { value: 'light', label: 'Light', hint: 'Always light' },
  { value: 'dark', label: 'Dark', hint: 'Always dark' },
]

function SettingsPage() {
  const [theme, setTheme] = useState(getThemePreference)

  function chooseTheme(value: ThemePreference) {
    setTheme(value)
    setThemePreference(value)
  }

  return (
    <main className="content settings">
      <h1 className="settings__title">Settings</h1>

      <fieldset className="settings-group">
        <legend className="settings-group__legend">Style</legend>
        {STYLE_OPTIONS.map((option) => (
          <label key={option.value} className="option">
            <input
              type="radio"
              name="theme"
              value={option.value}
              checked={theme === option.value}
              onChange={() => chooseTheme(option.value)}
            />
            <span className="option__text">
              <span className="option__label">{option.label}</span>
              <span className="option__hint">{option.hint}</span>
            </span>
          </label>
        ))}
      </fieldset>
    </main>
  )
}

export default SettingsPage
