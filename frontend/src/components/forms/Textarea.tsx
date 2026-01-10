import { TextareaHTMLAttributes, forwardRef } from 'react'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className="space-y-1">
        {label && (
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          className={`w-full px-4 py-2.5 bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-600/50 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all resize-none ${error ? 'border-red-500 focus:ring-red-500/50' : ''} ${className}`}
          rows={3}
          {...props}
        />
        {error && (
          <p className="text-sm text-red-400">{error}</p>
        )}
      </div>
    )
  }
)

Textarea.displayName = 'Textarea'
