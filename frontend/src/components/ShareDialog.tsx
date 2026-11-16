import { useEffect, useRef, useState } from 'react'
import type { Expense, Trip } from '../db'
import { shareFile } from '../export'
import { createShareLink } from '../shareLink'
import Button from './Button'
import { ShareIcon, WarningIcon } from './icons'
import './ConfirmDialog.css'

interface ShareDialogProps {
  open: boolean
  trip: Trip
  expenses: Expense[]
  receipts: Map<string, Blob>
  // The zip, built ahead of time so the share sheet opens straight from the tap
  exportFile: File | undefined
  onClose: () => void
}

type LinkState =
  | { step: 'choose' }
  | { step: 'creating' }
  | { step: 'ready'; url: string }
  | { step: 'failed' }

function ShareDialog({ open, trip, expenses, receipts, exportFile, onClose }: ShareDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [link, setLink] = useState<LinkState>({ step: 'choose' })
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  function close() {
    dialogRef.current?.close()
  }

  async function shareViaTally() {
    setLink({ step: 'creating' })
    try {
      const { url } = await createShareLink(trip, expenses, receipts)
      setLink({ step: 'ready', url })
    } catch (error) {
      console.error(error)
      setLink({ step: 'failed' })
    }
  }

  // A fresh tap, so iOS allows the share sheet even after the upload
  async function shareLink(url: string) {
    if (navigator.share) {
      try {
        await navigator.share({ url, title: trip.destination })
      } catch {
        // Cancelled
      }
    } else {
      await copyLink(url)
    }
  }

  async function copyLink(url: string) {
    await navigator.clipboard.writeText(url)
    setCopied(true)
  }

  return (
    <dialog
      ref={dialogRef}
      className="confirm-dialog"
      aria-labelledby="share-dialog-title"
      onClose={() => {
        setLink({ step: 'choose' })
        setCopied(false)
        onClose()
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) close()
      }}
    >
      <div className="confirm-dialog__panel">
        <h2 id="share-dialog-title" className="confirm-dialog__title">
          Share trip
        </h2>

        {link.step === 'choose' && (
          <div className="share-dialog__options">
            <Button
              icon={<ShareIcon />}
              disabled={!exportFile}
              onClick={() => {
                if (!exportFile) return
                shareFile(exportFile)
                close()
              }}
            >
              {exportFile ? 'Share' : 'Preparing…'}
            </Button>
            <Button variant="ghost" onClick={shareViaTally}>
              Share via Tally
            </Button>
          </div>
        )}

        {link.step === 'creating' && <p className="field__hint">Creating link…</p>}

        {link.step === 'failed' && (
          <>
            <p className="field-warning" role="status">
              <WarningIcon />
              <span>Couldn't create a link. Check your connection and try again.</span>
            </p>
            <Button variant="ghost" onClick={shareViaTally}>
              Try again
            </Button>
          </>
        )}

        {link.step === 'ready' && (
          <div className="share-dialog__options">
            <input
              className="input"
              value={link.url}
              readOnly
              aria-label="Link to this trip"
              onFocus={(e) => e.target.select()}
            />
            <p className="field__hint">Anyone with this link can view this trip for 30 days.</p>
            <Button icon={<ShareIcon />} onClick={() => shareLink(link.url)}>
              Share link
            </Button>
            <Button variant="ghost" onClick={() => copyLink(link.url)}>
              {copied ? 'Copied' : 'Copy link'}
            </Button>
          </div>
        )}

        <Button variant="ghost" size="small" onClick={close}>
          Close
        </Button>
      </div>
    </dialog>
  )
}

export default ShareDialog
