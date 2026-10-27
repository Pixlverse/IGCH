import 'server-only'

import { z } from 'zod'

import settingsSeed from '@/content/seed/settings.json'
import { SiteSettingsSchema, type SiteSettings } from '@/lib/content/schemas'

/*
 * The site settings form edits the parts of the settings document that
 * change (announcement, phone, booking, address, social links). Everything
 * else (logo, SEO defaults, labels) is kept as stored.
 */

const url = (label: string) =>
  z
    .string()
    .trim()
    .refine(
      (v) => !v || v === '#' || v.startsWith('/') || /^https?:\/\//.test(v),
      `${label}: use a full URL or a site path`,
    )
    .transform((v) => v || '#')

const SettingsFormSchema = z.object({
  announcementBadge: z.string().trim().max(20),
  announcementLabel: z.string().trim().max(120),
  announcementHref: url('Announcement link'),
  phoneDisplay: z
    .string()
    .trim()
    .regex(/^[0-9 +()-]{6,20}$/, 'Use digits and spaces, e.g. 0484 294 1600'),
  phoneInternational: z.string().trim().max(25),
  hours: z.string().trim().max(80),
  bookingLabel: z.string().trim().max(40),
  bookingHref: url('Booking link'),
  addressFull: z.string().trim().min(1, 'Address is required').max(200),
  shortAddress: z.string().trim().max(80),
  postalCode: z.string().trim().max(10),
  unitLine: z.string().trim().max(160),
  careersEmail: z.union([
    z.literal(''),
    z.string().trim().toLowerCase().email('Enter a valid email'),
  ]),
  accreditations: z.array(z.string().trim().min(1).max(40)),
  social: z.array(z.object({ label: z.string(), href: url('Social link') })),
})

const SOCIAL = ['Facebook', 'Instagram', 'YouTube'] as const

export function currentSettings(stored: unknown): SiteSettings {
  return SiteSettingsSchema.parse(stored ?? settingsSeed)
}

/** Form defaults for the settings page. */
export function settingsFormValues(site: SiteSettings): Record<string, string> {
  const social = Object.fromEntries(site.social.map((s) => [s.label, s.href === '#' ? '' : s.href]))
  return {
    announcementBadge: site.announcement.badge,
    announcementLabel: site.announcement.label,
    announcementHref: site.announcement.href,
    phoneDisplay: site.emergency.phone.display,
    phoneInternational: site.emergency.phone.international,
    hours: site.emergency.hours,
    bookingLabel: site.booking.label,
    bookingHref: site.booking.href,
    addressFull: site.address.full,
    shortAddress: site.shortAddress,
    postalCode: site.address.postalCode,
    unitLine: site.unitLine,
    careersEmail: site.careersEmail,
    accreditations: site.accreditations.join('\n'),
    ...Object.fromEntries(SOCIAL.map((label) => [`social.${label}`, social[label] ?? ''])),
  }
}

export function settingsFromForm(
  stored: unknown,
  fd: FormData,
): { ok: true; data: SiteSettings } | { ok: false; errors: Record<string, string> } {
  const get = (name: string) => String(fd.get(name) ?? '')
  const parsed = SettingsFormSchema.safeParse({
    announcementBadge: get('announcementBadge'),
    announcementLabel: get('announcementLabel'),
    announcementHref: get('announcementHref'),
    phoneDisplay: get('phoneDisplay'),
    phoneInternational: get('phoneInternational'),
    hours: get('hours'),
    bookingLabel: get('bookingLabel'),
    bookingHref: get('bookingHref'),
    addressFull: get('addressFull'),
    shortAddress: get('shortAddress'),
    postalCode: get('postalCode'),
    unitLine: get('unitLine'),
    careersEmail: get('careersEmail').trim(),
    accreditations: get('accreditations')
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean),
    social: SOCIAL.map((label) => ({ label, href: get(`social.${label}`) })),
  })
  if (!parsed.success)
    return {
      ok: false,
      errors: Object.fromEntries(parsed.error.issues.map((i) => [i.path.join('.'), i.message])),
    }

  const v = parsed.data
  const site = currentSettings(stored)
  return {
    ok: true,
    data: {
      ...site,
      shortAddress: v.shortAddress,
      unitLine: v.unitLine,
      careersEmail: v.careersEmail,
      accreditations: v.accreditations,
      announcement: {
        ...site.announcement,
        badge: v.announcementBadge,
        label: v.announcementLabel,
        href: v.announcementHref,
      },
      emergency: {
        ...site.emergency,
        hours: v.hours,
        phone: {
          display: v.phoneDisplay,
          // tel: links need digits only
          tel: v.phoneDisplay.replace(/[^0-9+]/g, ''),
          international: v.phoneInternational,
        },
      },
      booking: { label: v.bookingLabel, href: v.bookingHref },
      address: { ...site.address, full: v.addressFull, postalCode: v.postalCode },
      social: v.social.filter((s) => s.href !== '#'),
    },
  }
}
