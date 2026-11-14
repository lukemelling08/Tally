import type { ButtonHTMLAttributes, ReactNode } from 'react'
import './Button.css'

// primary: brown on light backgrounds
// inverse: cream fill, for dark backgrounds
// ghost-inverse: cream outline, for secondary actions on dark backgrounds
// ghost: no fill, for secondary actions on cards and panels
// accent: burnt orange, reserved for key actions like "Submit expenses"
// danger: rust, for destructive actions like deleting
type ButtonVariant = 'primary' | 'inverse' | 'ghost-inverse' | 'ghost' | 'accent' | 'danger'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: 'normal' | 'small'
  icon?: ReactNode
}

// Icon-only buttons must be given an aria-label
function Button({
  variant = 'primary',
  size = 'normal',
  icon,
  children,
  className,
  type = 'button',
  ...props
}: ButtonProps) {
  const classes = [
    'button',
    `button--${variant}`,
    size === 'small' && 'button--small',
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
