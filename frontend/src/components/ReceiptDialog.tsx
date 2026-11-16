import { useEffect, useRef } from 'react'
import { useObjectUrl } from '../images'
import Button from './Button'
import { CloseIcon } from './icons'
import './ReceiptDialog.css'

interface ReceiptDialogProps {
  image: Blob | undefined
  title: string
  onClose: () => void
}

// Full-screen preview of a receipt photo; open while image is set
function ReceiptDialog({ image, title, onClose }: ReceiptDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const imageUrl = useObjectUrl(image)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (image && !dialog.open) dialog.showModal()
    if (!image && dialog.open) dialog.close()
  }, [image])

  return (
    <dialog
      ref={dialogRef}
      className="receipt-dialog"
      aria-label={`Receipt for ${title}`}
      onClose={onClose}
      // Tapping the dimmed backdrop closes it
      onClick={(event) => {
        if (event.target === event.currentTarget) dialogRef.current?.close()
      }}
    >
      <div className="receipt-dialog__panel">
        <div className="receipt-dialog__bar">
          <span className="receipt-dialog__title">{title}</span>
          <Button
            variant="ghost"
            size="small"
            icon={<CloseIcon />}
            aria-label="Close receipt"
            onClick={() => dialogRef.current?.close()}
          />
        </div>
        {imageUrl && (
          <img src={imageUrl} alt={`Receipt for ${title}`} className="receipt-dialog__image" />
        )}
      </div>
    </dialog>
  )
}

export default ReceiptDialog
