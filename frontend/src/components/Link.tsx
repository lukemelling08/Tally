import type { AnchorHTMLAttributes, MouseEvent } from 'react'
import { navigate } from '../router'

interface LinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  to: string
}

// A real link (so it works with keyboards and screen readers) that changes
// page without a reload. Modified clicks still open a new tab as usual.
function Link({ to, onClick, ...props }: LinkProps) {
  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    onClick?.(event)
    if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey) return
    event.preventDefault()
    navigate(to)
  }

  return <a href={to} onClick={handleClick} {...props} />
}

export default Link
