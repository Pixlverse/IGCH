import { expect, test } from '@playwright/test'

import about from '../../content/about.json'
import centres from '../../content/centres.json'
import facilitiesPage from '../../content/facilities-page.json'
import facilities from '../../content/facilities.json'
import guide from '../../content/guide.json'
import home from '../../content/home.json'
import library from '../../content/library.json'
import navigation from '../../content/navigation.json'
import newsPage from '../../content/news-page.json'
import news from '../../content/news.json'
import notices from '../../content/notices.json'
import careers from '../../content/careers.json'
import articles from '../../content/seed/articles.json'
import careersSeed from '../../content/seed/careers.json'
import departments from '../../content/seed/departments.json'
import doctors from '../../content/seed/doctors.json'
import faqs from '../../content/seed/faqs.json'
import newsSeed from '../../content/seed/news.json'
import noticesSeed from '../../content/seed/notices.json'
import settings from '../../content/seed/settings.json'
import specialitiesHub from '../../content/specialities-hub.json'
import specialities from '../../content/specialities.json'
import specialityGroups from '../../content/speciality-groups.json'
import { RESOURCES } from '../../lib/admin/resources'
import * as S from '../../lib/content/schemas'

/** Page copy (JSON, developer-edited) and the seeded site settings. */
const DOCS = [
  ['settings (seed)', S.SiteSettingsSchema, settings],
  ['navigation', S.NavigationSchema, navigation],
  ['home', S.HomePageSchema, home],
  ['centres', S.CentresSchema, centres],
  ['specialities', S.SpecialitiesSchema, specialities],
  ['guide', S.GuideSchema, guide],
  ['facilities', S.FacilitiesSchema, facilities],
  ['news', S.NewsCopySchema, news],
  ['notices', S.NoticesSchema, notices],
  ['about', S.AboutPageSchema, about],
  ['specialities-hub', S.SpecialitiesHubSchema, specialitiesHub],
  ['speciality-groups', S.SpecialityGroupPagesSchema, specialityGroups],
  ['library', S.LibrarySchema, library],
  ['news-page', S.NewsPageSchema, newsPage],
  ['facilities-page', S.FacilitiesPageSchema, facilitiesPage],
  ['careers', S.CareersPageSchema, careers],
] as const

/** Seed data for the admin-managed collections (what `pnpm seed` inserts). */
const SEEDS: Record<string, Record<string, unknown>[]> = {
  doctors,
  departments,
  news: newsSeed,
  notices: noticesSeed,
  articles,
  faqs,
  careers: careersSeed,
}

/** Collections that may start empty (no real data to seed yet). */
const MAY_BE_EMPTY = new Set(['careers'])

test.describe('seed data', () => {
  for (const resource of RESOURCES) {
    test(`${resource.key}: every seed item passes the admin validation`, () => {
      const items = SEEDS[resource.key] ?? []
      if (!MAY_BE_EMPTY.has(resource.key)) expect(items.length).toBeGreaterThan(0)
      const problems = items.flatMap((item, i) => {
        // dates are optional in the seed; the admin form always sends one (or null)
        const parsed = resource.schema.safeParse({ date: null, ...item })
        return parsed.success
          ? []
          : [
              `#${i}: ${parsed.error.issues.map((x) => `${x.path.join('.')} ${x.message}`).join('; ')}`,
            ]
      })
      expect(problems).toEqual([])
    })
  }

  test('news and article slugs are unique', () => {
    for (const items of [newsSeed, articles]) {
      const slugs = items.map((item) => item.slug)
      expect(new Set(slugs).size).toBe(slugs.length)
    }
  })
})

test.describe('content schemas', () => {
  for (const [name, schema, json] of DOCS) {
    test(`${name}.json is valid and lossless`, () => {
      // strict check: the shipped JSON must parse without any fallback kicking in
      expect(schema.parse(json)).toEqual(schema.parse(JSON.parse(JSON.stringify(json))))
      expect(JSON.stringify(schema.parse(json))).not.toBe(JSON.stringify(schema.parse({})))
    })
    test(`${name}: empty / broken input falls back instead of throwing`, () => {
      for (const input of [undefined, null, {}, [], 'x', 42])
        expect(() => schema.parse(input)).not.toThrow()
    })
  }

  test('invalid items are dropped, valid ones kept', () => {
    // same forgiving parse the site applies to rows from the database
    const parsed = S.DoctorsSchema.parse({
      items: [{ name: 'Dr. A', image: { src: '' } }, { nope: true }, 'junk'],
    })
    expect(parsed.items).toHaveLength(1)
    expect(parsed.items[0]).toMatchObject({ name: 'Dr. A', href: '#', image: undefined })
  })

  test('unknown enum values fall back to a safe default', () => {
    const parsed = S.BlogsSchema.parse({
      items: [{ title: 'T', accent: 'neon', category: { label: 'X', tone: 'pink' } }],
    })
    expect(parsed.items[0]).toMatchObject({ accent: 'red', category: { tone: 'green' } })
  })

  test('shipped JSON contains no fields the schema ignores', () => {
    // guards against typos in content keys silently doing nothing
    const unknownKeys = (value: unknown, parsed: unknown, path: string): string[] => {
      if (Array.isArray(value) && Array.isArray(parsed))
        return value.flatMap((v, i) => unknownKeys(v, parsed[i], `${path}[${i}]`))
      if (value && typeof value === 'object' && parsed && typeof parsed === 'object')
        return Object.entries(value).flatMap(([k, v]) =>
          k in parsed
            ? unknownKeys(v, (parsed as Record<string, unknown>)[k], `${path}.${k}`)
            : [`${path}.${k}`],
        )
      return []
    }
    const problems = DOCS.flatMap(([name, schema, json]) =>
      unknownKeys(json, schema.parse(json), name),
    )
    expect(problems).toEqual([])
  })
})
