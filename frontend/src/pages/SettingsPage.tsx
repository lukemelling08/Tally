import { useLiveQuery } from 'dexie-react-hooks'
import { useState, type FormEvent } from 'react'
import Button from '../components/Button'
import { PlusIcon, TrashIcon } from '../components/icons'
import { db, newId } from '../db'
import { formatGBP, toPence } from '../format'
import { getThemePreference, setThemePreference, type ThemePreference } from '../theme'
import './SettingsPage.css'

const STYLE_OPTIONS: { value: ThemePreference; label: string; hint: string }[] = [
  { value: 'standard', label: 'Standard', hint: "Matches your phone's setting" },
  { value: 'light', label: 'Light', hint: 'Always light' },
  { value: 'dark', label: 'Dark', hint: 'Always dark' },
]

function SettingsPage() {
  const [theme, setTheme] = useState(getThemePreference)
  const allowances = useLiveQuery(() => db.allowances.orderBy('createdAt').toArray())

  function chooseTheme(value: ThemePreference) {
    setTheme(value)
    setThemePreference(value)
  }

  async function addAllowance(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const data = new FormData(form)
    await db.allowances.add({
      id: newId(),
      name: String(data.get('name')).trim(),
      amount: toPence(String(data.get('amount'))),
      createdAt: new Date().toISOString(),
    })
    form.reset()
  }

  return (
    <main className="content narrow">
      <h1 className="page-title">Settings</h1>

      <fieldset className="settings-group">
        <legend className="section-label">Style</legend>
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

      <section className="settings-group" aria-labelledby="allowances-heading">
        <h2 id="allowances-heading" className="section-label">
          Allowances
        </h2>

        {allowances && allowances.length > 0 && (
          <ul className="allowance-list">
            {allowances.map((allowance) => (
              <li key={allowance.id} className="allowance-card">
                <span className="allowance-card__name">{allowance.name}</span>
                <span className="allowance-card__amount">{formatGBP(allowance.amount)}</span>
                <Button
                  variant="ghost"
                  size="small"
                  icon={<TrashIcon />}
                  aria-label={`Delete ${allowance.name} allowance`}
                  className="allowance-card__delete"
                  onClick={() => db.allowances.delete(allowance.id)}
                />
              </li>
            ))}
          </ul>
        )}

        <form className="allowance-form" onSubmit={addAllowance}>
          <div className="field">
            <label className="field__label" htmlFor="allowance-name">
              Name
            </label>
            <input
              id="allowance-name"
              name="name"
              className="input"
              required
              autoComplete="off"
            />
          </div>
          <div className="field">
            <label className="field__label" htmlFor="allowance-amount">
              Amount (£)
            </label>
            <input
              id="allowance-amount"
              name="amount"
              className="input"
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              required
            />
          </div>
          <Button type="submit" icon={<PlusIcon />} className="allowance-form__submit">
            Add allowance
          </Button>
        </form>
      </section>
    </main>
  )
}

export default SettingsPage
