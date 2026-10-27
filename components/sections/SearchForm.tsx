'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { Icon } from '@/components/icons/Icon'

const SearchSchema = z.object({ q: z.string().trim().max(200) })
type SearchValues = z.infer<typeof SearchSchema>

type SearchFormProps = {
  label: string
  placeholder: string
  buttonLabel: string
  /** Called with the query. The original had no search backend, so the default is a no-op. */
  onSearch?: (query: string) => void
}

export function SearchForm({ label, placeholder, buttonLabel, onSearch }: SearchFormProps) {
  const { register, handleSubmit } = useForm<SearchValues>({
    resolver: zodResolver(SearchSchema),
    defaultValues: { q: '' },
  })

  return (
    <form className="search-form" role="search" onSubmit={handleSubmit(({ q }) => onSearch?.(q))}>
      <label className="search-label" htmlFor="q">
        {label}
      </label>
      <div className="search">
        <input id="q" type="search" placeholder={placeholder} {...register('q')} />
        <button className="btn btn--primary" type="submit" aria-label={buttonLabel}>
          <Icon name="search" />
          <span>{buttonLabel}</span>
        </button>
      </div>
    </form>
  )
}
