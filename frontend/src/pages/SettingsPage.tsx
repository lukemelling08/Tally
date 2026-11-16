import { useLiveQuery } from 'dexie-react-hooks'
import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react'
import Button from '../components/Button'
import ConfirmDialog from '../components/ConfirmDialog'
import { DownloadIcon, PlusIcon, TrashIcon, WarningIcon } from '../components/icons'
import { db, newId } from '../db'
import { downloadFile } from '../export'
import { formatGBP, toPence } from '../format'
import { applySync, buildSyncFile, readSyncFile, type SyncContents } from '../sync'
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
  const [syncFile, setSyncFile] = useState<File>()
  const [incoming, setIncoming] = useState<SyncContents | null>(null)
  const [syncMessage, setSyncMessage] = useState<{ text: string; error?: boolean }>()
  const [lastSync, setLastSync] = useState(0)
  const syncInput = useRef<HTMLInputElement>(null)

  // Built ahead of time so the share sheet opens straight from the tap (iOS
  // requires that). Rebuilt when allowances change here or after receiving.
  useEffect(() => {
    let cancelled = false
    buildSyncFile().then((file) => {
      if (!cancelled) setSyncFile(file)
    })
    return () => {
      cancelled = true
    }
  }, [allowances, lastSync])

  async function chooseSyncFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    try {
      setIncoming(await readSyncFile(file))
      setSyncMessage(undefined)
    } catch (error) {
      setSyncMessage({ text: (error as Error).message, error: true })
    }
  }

  async function confirmSync() {
    if (!incoming) return
    const { trips, expenses } = incoming.data
    try {
      await applySync(incoming)
      setSyncMessage({ text: `Loaded ${trips.length} trips and ${expenses.length} expenses.` })
      setLastSync(Date.now())
    } catch (error) {
      console.error(error)
      setSyncMessage({ text: "Couldn't load the data. Nothing on this device was changed.", error: true })
    }
    setIncoming(null)
  }

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

      <section className="settings-group" aria-labelledby="sync-heading">
        <h2 id="sync-heading" className="section-label">
          Data
        </h2>
        <div className="sync-panel">
          <Button
            icon={<DownloadIcon />}
            disabled={!syncFile}
            onClick={() => syncFile && downloadFile(syncFile)}
          >
            Download data
          </Button>
          <input
            ref={syncInput}
            type="file"
            accept=".zip,application/zip"
            className="visually-hidden"
            tabIndex={-1}
            aria-hidden="true"
            onChange={chooseSyncFile}
          />
          <Button variant="ghost" onClick={() => syncInput.current?.click()}>
            Load data
          </Button>

          {syncMessage && (
            <p className={syncMessage.error ? 'field-warning' : 'field__hint'} role="status">
              {syncMessage.error && <WarningIcon />}
              <span>{syncMessage.text}</span>
            </p>
          )}
        </div>
      </section>

      <ConfirmDialog
        open={incoming !== null}
        title="Replace this phone's data?"
        confirmLabel="Replace"
        onConfirm={confirmSync}
        onCancel={() => setIncoming(null)}
      >
        {incoming && (
          <p>
            Everything on this phone will be replaced with {incoming.data.trips.length} trips,{' '}
            {incoming.data.expenses.length} expenses and {incoming.data.allowances.length}{' '}
            allowances from the file. This can't be undone.
          </p>
        )}
      </ConfirmDialog>
    </main>
  )
}

export default SettingsPage
