import PhoneInput from 'react-phone-number-input'
import 'react-phone-number-input/style.css'
import { cn } from '@/lib/utils'

interface InternationalPhoneInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  disabled?: boolean
  id?: string
}

export function InternationalPhoneInput({
  value,
  onChange,
  placeholder = '20 000 0000',
  className,
  disabled,
  id,
}: InternationalPhoneInputProps) {
  return (
    <div className={cn('phone-input-wrapper', className)}>
      <PhoneInput
        id={id}
        international
        defaultCountry="GH"
        value={value}
        onChange={(val) => onChange(val ?? '')}
        placeholder={placeholder}
        disabled={disabled}
      />
    </div>
  )
}

export { isValidPhoneNumber } from 'react-phone-number-input'
