'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { Icon } from '@/components/icons/Icon'
import { SmartLink } from '@/components/ui/SmartLink'

const SearchSchema = z.object({ q: z.string().trim().max(200) })
type SearchValues = z.infer<typeof SearchSchema>

export type SearchEntry = {
  name: string
  group: string
  href: string
  /** extra text to match against (short name, description) */
  keywords: string
}

type SpecialitySearchProps = {
  label: string
  placeholder: string
  buttonLabel: string
  entries: SearchEntry[]
  emptyText: string
}

const MAX_RESULTS = 6

/** Department search: matches names and descriptions as you submit, lists links. */
export function SpecialitySearch({
  label,
  placeholder,
  buttonLabel,
  entries,
  emptyText,
}: SpecialitySearchProps) {
  const [query, setQuery] = useState<string | null>(null)
  const { register, handleSubmit } = useForm<SearchValues>({
    resolver: zodResolver(SearchSchema),
    defaultValues: { q: '' },
  })

  const needle = query?.toLowerCase() ?? ''
  const results = needle
    ? entries
        .filter((entry) => `${entry.name} ${entry.keywords}`.toLowerCase().includes(needle))
        .slice(0, MAX_RESULTS)
    : []

  return (
    <form
      className="search-form"
      role="search"
      onSubmit={handleSubmit(({ q }) => setQuery(q || null))}
    >
      <label className="search-label" htmlFor="speciality-q">
        {label}
      </label>
      <div className="search">
        <input
          id="speciality-q"
          type="search"
          placeholder={placeholder}
          autoComplete="off"
          {...register('q', { onChange: (e) => !e.target.value && setQuery(null) })}
        />
        <button className="btn btn--dark" type="submit" aria-label={buttonLabel}>
          <Icon name="search" />
          <span>{buttonLabel}</span>
        </button>
      </div>
      <div className="search-results" aria-live="polite">
        {query !== null &&
          (results.length > 0 ? (
            <ul>
              {results.map((entry) => (
                <li key={entry.name}>
                  <SmartLink href={entry.href}>
                    <strong>{entry.name}</strong>
                    <span>{entry.group}</span>
                  </SmartLink>
                </li>
              ))}
            </ul>
          ) : (
            <p>{emptyText}</p>
          ))}
      </div>
    </form>
  )
}
