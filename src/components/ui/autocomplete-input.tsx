'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

export interface AutocompleteSuggestion {
  id: string
  label: string
  secondary?: string
}

interface AutocompleteInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onSelect'> {
  label?: string
  error?: string
  hint?: string
  suggestions: AutocompleteSuggestion[]
  loading?: boolean
  onSelect: (suggestion: AutocompleteSuggestion) => void
}

export const AutocompleteInput = React.forwardRef<HTMLInputElement, AutocompleteInputProps>(
  ({ className, label, error, hint, id, suggestions, loading, onSelect, onFocus, onBlur, onKeyDown, ...props }, ref) => {
    const inputId = id ?? React.useId()
    const [showDropdown, setShowDropdown] = React.useState(false)
    const [activeIndex, setActiveIndex] = React.useState(-1)
    const containerRef = React.useRef<HTMLDivElement>(null)
    const listRef = React.useRef<HTMLUListElement>(null)

    const hasSuggestions = suggestions.length > 0

    // Show dropdown when input focused and there are suggestions
    React.useEffect(() => {
      if (hasSuggestions) {
        setShowDropdown(true)
      }
    }, [hasSuggestions])

    // Reset active index when suggestions change
    React.useEffect(() => {
      setActiveIndex(-1)
    }, [suggestions])

    function handleFocus(e: React.FocusEvent<HTMLInputElement>) {
      if (hasSuggestions) setShowDropdown(true)
      onFocus?.(e)
    }

    function handleBlur(e: React.FocusEvent<HTMLInputElement>) {
      // Delay closing so click on suggestion can fire first
      setTimeout(() => {
        if (!containerRef.current?.contains(document.activeElement)) {
          setShowDropdown(false)
        }
      }, 200)
      onBlur?.(e)
    }

    function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
      if (!showDropdown || !hasSuggestions) {
        onKeyDown?.(e)
        return
      }

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          setActiveIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0))
          break
        case 'ArrowUp':
          e.preventDefault()
          setActiveIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1))
          break
        case 'Enter':
          if (activeIndex >= 0 && activeIndex < suggestions.length) {
            e.preventDefault()
            onSelect(suggestions[activeIndex])
            setShowDropdown(false)
          }
          break
        case 'Escape':
          setShowDropdown(false)
          break
        default:
          break
      }
      onKeyDown?.(e)
    }

    function handleSelect(suggestion: AutocompleteSuggestion) {
      onSelect(suggestion)
      setShowDropdown(false)
    }

    // Scroll active item into view
    React.useEffect(() => {
      if (activeIndex >= 0 && listRef.current) {
        const item = listRef.current.children[activeIndex] as HTMLElement
        item?.scrollIntoView({ block: 'nearest' })
      }
    }, [activeIndex])

    return (
      <div className="flex flex-col gap-1.5 relative" ref={containerRef}>
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-bold text-on-surface-variant"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <input
            ref={ref}
            id={inputId}
            className={cn(
              'h-11 w-full rounded-md border bg-surface-lowest px-3 text-on-surface placeholder:text-outline',
              'border-outline-variant/20 transition-all outline-none',
              'focus:border-primary/40 focus:ring-2 focus:ring-primary/10',
              'disabled:opacity-40 disabled:cursor-not-allowed',
              error && 'border-error/60 focus:border-error focus:ring-error/10',
              className
            )}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            autoComplete="off"
            {...props}
          />
          {loading && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2">
              <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            </div>
          )}
        </div>

        {/* Dropdown */}
        {showDropdown && hasSuggestions && (
          <ul
            ref={listRef}
            className="absolute top-full left-0 right-0 z-50 mt-1 max-h-48 overflow-auto bg-surface-high rounded-lg border border-white/5 shadow-2xl"
          >
            {suggestions.map((suggestion, index) => (
              <li
                key={suggestion.id}
                className={cn(
                  'px-3 py-2.5 cursor-pointer transition-colors text-right',
                  index === activeIndex
                    ? 'bg-primary/10 text-on-surface'
                    : 'hover:bg-white/5 text-on-surface'
                )}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => handleSelect(suggestion)}
                onMouseEnter={() => setActiveIndex(index)}
              >
                <span className="text-sm font-bold block">{suggestion.label}</span>
                {suggestion.secondary && (
                  <span className="text-xs text-on-surface-variant block mt-0.5" dir="ltr">
                    {suggestion.secondary}
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}

        {hint && !error && (
          <p className="text-xs text-outline">{hint}</p>
        )}
        {error && (
          <p className="text-xs text-error">{error}</p>
        )}
      </div>
    )
  }
)
AutocompleteInput.displayName = 'AutocompleteInput'
