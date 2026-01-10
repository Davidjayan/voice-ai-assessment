import { SelectHTMLAttributes, forwardRef } from 'react'

interface Option {
  value: string
  label: string
}

interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'children'> {
  label?: string
  error?: string
  options: Option[]
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, className = '', ...props }, ref) => {
    return (
      <div className="space-y-1">
        {label && (
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            {label}
          </label>
        )}
        <select
          ref={ref}
          className={`w-full px-4 py-2.5 bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-600/50 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all appearance-none cursor-pointer ${error ? 'border-red-500 focus:ring-red-500/50' : ''} ${className}`}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value} className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">
              {option.label}
            </option>
          ))}
        </select>
        {error && (
          <p className="text-sm text-red-400">{error}</p>
        )}
      </div>
    )
  }
)

Select.displayName = 'Select'
