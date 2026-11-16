import type { SVGProps } from 'react'

const iconProps: SVGProps<SVGSVGElement> = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
}

export function PlusIcon() {
  return (
    <svg {...iconProps}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  )
}

export function UserIcon() {
  return (
    <svg {...iconProps}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </svg>
  )
}

export function CheckIcon() {
  return (
    <svg {...iconProps}>
      <path d="M5 12l5 5 9-10" />
    </svg>
  )
}

export function ClockIcon() {
  return (
    <svg {...iconProps}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  )
}

export function TrashIcon() {
  return (
    <svg {...iconProps}>
      <path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" />
    </svg>
  )
}

export function CloseIcon() {
  return (
    <svg {...iconProps}>
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  )
}

export function CameraIcon() {
  return (
    <svg {...iconProps}>
      <path d="M4 8h3l2-3h6l2 3h3v11H4z" />
      <circle cx="12" cy="13" r="3.5" />
    </svg>
  )
}

export function ReceiptIcon() {
  return (
    <svg {...iconProps}>
      <path d="M6 3h12v18l-3-2-3 2-3-2-3 2zM9 8h6M9 12h6" />
    </svg>
  )
}

export function WarningIcon() {
  return (
    <svg {...iconProps}>
      <path d="M12 3l10 18H2zM12 10v5M12 18v.5" />
    </svg>
  )
}

export function ShareIcon() {
  return (
    <svg {...iconProps}>
      <path d="M12 15V3M7 8l5-5 5 5M5 12v9h14v-9" />
    </svg>
  )
}

export function DownloadIcon() {
  return (
    <svg {...iconProps}>
      <path d="M12 3v12M7 10l5 5 5-5M5 21h14" />
    </svg>
  )
}

export function ArrowUpIcon() {
  return (
    <svg {...iconProps}>
      <path d="M12 19V5M5 12l7-7 7 7" />
    </svg>
  )
}
