'use client'

import clsx from 'clsx'
import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'

import { Icon } from '@/components/icons/Icon'

const MenuContext = createContext<{ open: boolean; toggle: () => void; close: () => void }>({
  open: false,
  toggle: () => {},
  close: () => {},
})

export const useMenu = () => useContext(MenuContext)

/** The <header> element itself, owning the mobile-menu `is-open` state. */
export function HeaderShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)
  const toggle = useCallback(() => setOpen((o) => !o), [])
  const close = useCallback(() => setOpen(false), [])
  return (
    <MenuContext.Provider value={{ open, toggle, close }}>
      <header className={clsx('header', open && 'is-open')} id="header">
        {children}
      </header>
    </MenuContext.Provider>
  )
}

export function MenuToggle({ label }: { label: string }) {
  const { open, toggle } = useMenu()
  return (
    <button
      type="button"
      className="menu-toggle"
      aria-label={label}
      aria-expanded={open}
      aria-controls="main-nav"
      onClick={toggle}
    >
      <Icon name="menu" />
    </button>
  )
}
