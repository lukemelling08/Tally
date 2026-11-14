import { useEffect, useState } from 'react'

const MAX_DIMENSION = 1600

// Phone photos are 3–5 MB; shrinking to 1600px JPEG keeps receipts readable
// at a few hundred KB. Falls back to the original if the image can't be decoded.
export async function compressImage(file: File): Promise<Blob> {
  try {
    const bitmap = await createImageBitmap(file)
    const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height))
    const canvas = document.createElement('canvas')
    canvas.width = Math.round(bitmap.width * scale)
    canvas.height = Math.round(bitmap.height * scale)
    canvas.getContext('2d')?.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
    bitmap.close()
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, 'image/jpeg', 0.8),
    )
    return blob ?? file
  } catch {
    return file
  }
}

// A temporary URL for showing a stored image, released when no longer needed.
// Creating and revoking the URL is a side effect, so it has to live in an
// effect; creating it during render would leak or revoke it too early.
export function useObjectUrl(blob: Blob | undefined) {
  const [url, setUrl] = useState<string>()

  useEffect(() => {
    if (!blob) {
      // oxlint-disable-next-line react/set-state-in-effect
      setUrl(undefined)
      return
    }
    const objectUrl = URL.createObjectURL(blob)
    // oxlint-disable-next-line react/set-state-in-effect
    setUrl(objectUrl)
    return () => URL.revokeObjectURL(objectUrl)
  }, [blob])

  return url
}
