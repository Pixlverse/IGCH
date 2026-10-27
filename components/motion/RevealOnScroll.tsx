'use client'

import { animate, inView } from 'motion'
import { useEffect } from 'react'

const OFFSET = 'translateY(16px)'

/**
 * Subtle entrance for blocks marked `data-reveal` (no wrapper elements).
 *
 * - Progressive enhancement: content is server-rendered visible; only blocks
 *   that start below the fold are hidden, and only once JS is running.
 * - Respects prefers-reduced-motion (does nothing).
 * - Animates opacity/transform only, then removes the inline styles so the
 *   resting state is exactly the original CSS.
 */
export function RevealOnScroll() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const stops: VoidFunction[] = []
    const viewport = window.innerHeight

    document.querySelectorAll<HTMLElement>('[data-reveal]').forEach((el) => {
      if (el.getBoundingClientRect().top < viewport) return

      el.style.opacity = '0'
      el.style.transform = OFFSET

      const stop = inView(
        el,
        () => {
          stop()
          animate(
            el,
            { opacity: [0, 1], transform: [OFFSET, 'translateY(0px)'] },
            { duration: 0.5, ease: [0.2, 0.8, 0.2, 1] },
          ).finished.then(() =>
            // motion commits its final keyframe after `finished`; clear on the next frame
            requestAnimationFrame(() => {
              el.style.removeProperty('opacity')
              el.style.removeProperty('transform')
              if (!el.getAttribute('style')) el.removeAttribute('style')
            }),
          )
        },
        { margin: '0px 0px -8% 0px' },
      )
      stops.push(() => {
        stop()
        el.style.removeProperty('opacity')
        el.style.removeProperty('transform')
      })
    })

    return () => stops.forEach((stop) => stop())
  }, [])

  return null
}
