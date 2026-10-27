'use client'

import { useState } from 'react'

type Language = { code: string; label: string }

/** Visual state only, as in the original, until a Malayalam version exists. */
export function LanguageToggle({ languages, label }: { languages: Language[]; label: string }) {
  const [active, setActive] = useState(languages[0]?.code)
  if (languages.length < 2) return null
  return (
    <div className="lang" role="group" aria-label={label}>
      {languages.map((lang) => {
        const on = lang.code === active
        return (
          <button
            key={lang.code}
            type="button"
            className={on ? 'is-on' : undefined}
            aria-pressed={on}
            lang={lang.code === 'en' ? undefined : lang.code}
            onClick={() => setActive(lang.code)}
          >
            {lang.label}
          </button>
        )
      })}
    </div>
  )
}
