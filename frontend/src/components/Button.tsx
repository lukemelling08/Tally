import type { ButtonHTMLAttributes, ReactNode } from 'react'
import './Button.css'

// primary: brown on light backgrounds
// inverse: cream fill, for dark backgrounds
// ghost-inverse: cream outline, for secondary actions on dark backgrounds
// accent: burnt orange, reserved for key actions like "Submit expenses"
type ButtonVariant = 'primary' | 'inverse' | 'ghost-inverse' | 'accent'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  icon?: ReactNode
}

// Icon-only buttons must be given an aria-label
function Button({
  variant = 'primary',
  icon,
  children,
  className,
  type = 'button',
  ...props
}: ButtonProps) {
  const classes = [
    'button',
    `button--${variant}`,
    !children && 'button--icon-only',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <button type={type} className={classes} {...props}>
      {icon}
      {children && <span>{children}</span>}
    </button>
  )
}

export default Button
