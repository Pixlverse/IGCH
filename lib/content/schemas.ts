import { z } from 'zod'

/*
 * Content schemas. Every schema is forgiving: a missing or malformed field
 * falls back to an empty value instead of throwing, so a half-filled CMS entry
 * degrades to an empty state rather than a broken page. Parsing `{}` against
 * any document schema yields a valid (empty) document.
 */

// ---------- primitives ----------

const str = () => z.string().catch('')
const href = () => z.string().min(1).catch('#')
const bool = (fallback = false) => z.boolean().catch(fallback)

function obj<T extends z.ZodRawShape>(shape: T) {
  const schema = z.object(shape)
  return schema.catch(() => schema.parse({}))
}

/** Array that silently drops invalid items instead of failing the whole list. */
function list<T extends z.ZodType>(item: T) {
  return z
    .array(z.unknown())
    .catch([])
    .transform((items) =>
      items.flatMap((raw) => {
        const parsed = item.safeParse(raw)
        return parsed.success ? [parsed.data as z.output<T>] : []
      }),
    )
}

function oneOf<const T extends readonly [string, ...string[]]>(values: T, fallback: T[number]) {
  return z.enum(values).catch(fallback)
}

export const ICONS = [
  'arrow',
  'chev',
  'phone',
  'search',
  'calendar',
  'pin',
  'doc',
  'file',
  'parking',
  'bed',
  'route',
  'clipboard',
  'plus',
  'shield',
  'cup',
  'pulse',
  'heart',
  'megaphone',
  'play',
  'check',
  'grid',
  'menu',
] as const
export type IconName = (typeof ICONS)[number]

export const TAG_TONES = [
  'green',
  'red',
  'purple',
  'yellow',
  'blue',
  'white',
  'dark',
  'glass',
  'lime',
  'emergency',
] as const
export type TagTone = (typeof TAG_TONES)[number]

/** Inline SVG illustrations (components/illustrations) that content can pick from. */
export const ILLUSTRATIONS = [
  'heart',
  'ambulance',
  'building',
  'family',
  'consult',
  'oncology',
  'paediatric',
  'kidney',
  'pacemaker',
  'nurses',
  'support',
] as const
export type IllustrationName = (typeof ILLUSTRATIONS)[number]
const illustration = (fallback: IllustrationName = 'consult') => oneOf(ILLUSTRATIONS, fallback)

/** Soft colour families used for icon boxes and tinted cards. */
export const TONES = ['green', 'purple', 'yellow', 'red', 'blue'] as const
export type Tone = (typeof TONES)[number]

/** Button styles content may choose for a CTA. */
const ctaStyle = () => oneOf(['primary', 'light', 'white', 'outline', 'dark'], 'primary')
const cta = () => z.object({ label: z.string().min(1), href: href(), style: ctaStyle() })

export const ImageSchema = z.object({
  src: z.string().min(1),
  alt: str(),
  /** intrinsic pixel size of the file, used to reserve space (no CLS) */
  width: z.number().int().positive(),
  height: z.number().int().positive(),
})
const image = () => ImageSchema.optional().catch(undefined)

export const LinkSchema = z.object({ label: str(), href: href() })
const link = () => obj({ label: str(), href: href() })

export const TagSchema = z.object({ label: str(), tone: oneOf(TAG_TONES, 'green') })
const tag = () => obj({ label: str(), tone: oneOf(TAG_TONES, 'green') })

/** Page heading with one highlighted run: `{before} <accent>{accent}</accent>{after}`. */
const accentTitle = () => obj({ before: str(), accent: str(), after: str() })

const qa = () =>
  list(z.object({ question: z.string().min(1), answer: list(z.string()), open: bool() }))

const quickCheck = () => obj({ eyebrow: str(), heading: str(), items: qa() })

const sectionHead = () =>
  obj({
    eyebrow: str(),
    heading: str(),
    /** removes the 780px max-width on the heading */
    wide: bool(),
    link: link(),
  })

// ---------- site settings ----------

export const SiteSettingsSchema = obj({
  name: str(),
  /** wordmark used for the footer watermark */
  shortName: str(),
  locationLine: str(),
  shortAddress: str(),
  logo: image(),
  address: obj({
    full: str(),
    streetAddress: str(),
    locality: str(),
    region: str(),
    postalCode: str(),
    country: str(),
  }),
  unitLine: str(),
  /** where "Send your CV" goes; empty hides the email option */
  careersEmail: z.string().email().catch(''),
  /** announcement strip above the header; hidden when `label` is empty */
  announcement: obj({ badge: str(), label: str(), href: href(), ariaLabel: str() }),
  emergency: obj({
    /** `display` is shown to people, `tel` goes in tel: links */
    phone: obj({ display: str(), tel: str(), international: str() }),
    headerLabel: str(),
    heroLabel: str(),
    footerLabel: str(),
    hours: str(),
    callNowLabel: str(),
    /** `{phone}` is replaced with the display number */
    callLabel: str(),
  }),
  booking: link(),
  languages: list(z.object({ code: z.string().min(1), label: z.string().min(1) })),
  languageGroupLabel: str(),
  menuLabel: str(),
  accreditations: list(z.string().min(1)),
  social: list(LinkSchema),
  copyright: str(),
  seo: obj({
    siteUrl: z.string().url().catch('https://igchkochi.com'),
    defaultTitle: str(),
    defaultDescription: str(),
    ogImage: image(),
    locale: z.string().catch('en_IN'),
  }),
})

export const NavigationSchema = obj({
  header: list(
    z.object({
      label: z.string().min(1),
      href: href(),
      hasMenu: bool(),
      /** dropdown links; shown when `hasMenu` is set */
      children: list(LinkSchema),
    }),
  ),
  footer: list(z.object({ heading: str(), links: list(LinkSchema) })),
})

// ---------- home page ----------

export const HomePageSchema = obj({
  seo: obj({ title: str(), description: str() }),
  hero: obj({
    tag: str(),
    title: obj({ line1: str(), accent: str(), rest: str() }),
    lead: str(),
    secondaryCta: link(),
    search: obj({ label: str(), placeholder: str(), buttonLabel: str() }),
    chips: list(LinkSchema),
    image: image(),
    fiveG: obj({
      badge: str(),
      newLabel: str(),
      title: str(),
      subtitle: str(),
      linkLabel: str(),
      href: href(),
    }),
  }),
  stats: obj({
    ariaLabel: str(),
    items: list(
      z.object({ value: str(), caption: str(), style: oneOf(['plain', 'green', 'lime'], 'plain') }),
    ),
  }),
  centres: obj({ head: sectionHead() }),
  specialities: obj({
    head: sectionHead(),
    journey: obj({
      heading: str(),
      steps: list(
        z.object({ label: str(), title: str(), hint: str(), icon: oneOf(ICONS, 'grid') }),
      ),
    }),
    /** `{count}` is replaced with the total number of departments */
    filterPlaceholder: str(),
    filterAriaLabel: str(),
    /** `{phone}` becomes a tel: link */
    helpText: str(),
    countSuffix: str(),
    countOf: str(),
    emptyText: str(),
  }),
  doctors: obj({ head: sectionHead() }),
  guide: obj({ head: sectionHead() }),
  walkthrough: obj({
    tag: tag(),
    title: str(),
    body: str(),
    cta: link(),
    playLabel: str(),
    image: image(),
  }),
  facilities: obj({
    head: sectionHead(),
    ambulance: obj({
      tag: tag(),
      heading: str(),
      /** `{phone}` is replaced with the display number */
      callLabel: str(),
      image: image(),
    }),
  }),
  coop: obj({
    tag: tag(),
    heading: obj({ main: str(), emphasis: str() }),
    body: str(),
    points: list(z.object({ title: str(), caption: str() })),
    ctas: list(
      z.object({ label: str(), href: href(), style: oneOf(['white', 'outline'], 'white') }),
    ),
    image: image(),
  }),
  news: obj({ head: sectionHead() }),
  blogs: obj({ head: sectionHead() }),
  faq: obj({ tag: str(), heading: str() }),
  nursing: obj({
    tag: tag(),
    heading: str(),
    paragraphs: list(z.string()),
    cta: link(),
    image: image(),
  }),
})

// ---------- collections ----------

const centreBase = {
  image: image(),
  tag: tag(),
  title: str(),
  body: str(),
  link: link(),
}
export const CentresSchema = obj({
  feature: obj(centreBase),
  cards: list(z.object({ ...centreBase, variant: oneOf(['purple', 'cream'], 'purple') })),
})

export const SpecialitiesSchema = obj({
  groups: list(
    z.object({
      /** URL segment under /specialities; also the key for speciality-groups.json */
      slug: str(),
      title: str(),
      tagline: str(),
      /** one-line description on the /specialities group cards */
      summary: str(),
      icon: oneOf(ICONS, 'pulse'),
      color: oneOf(['green', 'amber', 'blue'], 'green'),
      illustration: illustration(),
      viewAll: link(),
      departments: list(
        z.object({
          name: z.string().min(1),
          /** compact label for cards and chips, e.g. "CTVS" */
          shortName: str(),
          description: str(),
          href: href(),
          /** listed as a chip on the /specialities group card */
          featured: bool(),
          badge: tag(),
          /** icon-box colour; falls back to a repeating palette */
          tone: oneOf(TONES, 'green').optional().catch(undefined),
        }),
      ),
    }),
  ),
})

export const DoctorsSchema = obj({
  items: list(
    z.object({
      name: z.string().min(1),
      department: str(),
      qualifications: str(),
      href: href(),
      image: image(),
      /** speciality group slugs this doctor is listed under */
      groups: list(z.string()),
      /** shown on the home page */
      featured: bool(true),
      /** OPD days, for the doctor finder; empty means "any day" */
      days: list(z.string()),
    }),
  ),
})

export const GuideSchema = obj({
  hero: obj({ image: image(), title: str(), body: str() }),
  cards: list(
    z.object({
      icon: oneOf(ICONS, 'pin'),
      tone: oneOf(['sky', 'lav', 'lime', 'yellow', 'mint', 'rose', 'grey'], 'mint'),
      title: str(),
      body: str(),
      href: href(),
      tag: z.string().optional().catch(undefined),
      steps: list(z.string()),
    }),
  ),
  cta: link(),
})

export const FacilitiesSchema = obj({
  items: list(
    z.object({
      icon: oneOf(ICONS, 'shield'),
      tone: oneOf(['green', 'amber', 'red', 'blue'], 'green'),
      title: str(),
      body: str(),
      href: href(),
    }),
  ),
})

/** content/news.json: copy for the home-page news block (items come from the news collection). */
export const NewsCopySchema = obj({ featuredBadge: str(), linkLabel: str() })

/** One news item as the site shows it (from the `news` collection). */
export const NewsItemSchema = z.object({
  id: z.string(),
  slug: z.string(),
  href: href(),
  title: z.string().min(1),
  summary: str(),
  body: list(z.string()),
  /** formatted, e.g. "25 Oct 2026"; empty when not set */
  date: str(),
  readTime: str(),
  tag: tag(),
  image: image(),
  illustration: illustration(),
  featured: bool(),
})

/** One article as the site shows it (from the `articles` collection). */
export const ArticleItemSchema = z.object({
  id: z.string().min(1),
  slug: z.string(),
  category: str(),
  title: z.string().min(1),
  summary: str(),
  body: list(z.string()),
  reviewedBy: str(),
  readTime: str(),
  date: str(),
  href: href(),
  featured: bool(),
  image: image(),
  /** overrides the category's illustration */
  illustration: oneOf(ILLUSTRATIONS, 'consult').optional().catch(undefined),
})

export const NewsSchema = obj({
  lead: obj({
    image: image(),
    tag: tag(),
    badge: str(),
    meta: str(),
    title: str(),
    teaser: str(),
    linkLabel: str(),
    href: href(),
  }),
  cards: list(z.object({ image: image(), tag: tag(), title: str(), date: str(), href: href() })),
})

const boardItem = {
  day: str(),
  month: str(),
  title: str(),
  href: href(),
}
export const NoticesSchema = obj({
  title: str(),
  ariaLabel: str(),
  /** shown in the date box when a notice has no date yet */
  dateTbc: obj({ day: str(), month: str() }),
  announcements: obj({
    tabLabel: str(),
    viewAll: link(),
    kindLabel: str(),
    items: list(z.object({ ...boardItem, kind: str() })),
  }),
  tenders: obj({
    tabLabel: str(),
    viewAll: link(),
    /** `{date}` is replaced with the closing date */
    lastDateLabel: str(),
    items: list(z.object({ ...boardItem, status: str(), lastDate: str() })),
  }),
})

export const BlogsSchema = obj({
  items: list(
    z.object({
      category: tag(),
      accent: oneOf(['red', 'brown', 'purple', 'teal'], 'red'),
      title: str(),
      meta: str(),
      href: href(),
    }),
  ),
})

export const FaqsSchema = obj({
  items: list(
    z.object({
      question: z.string().min(1),
      answer: list(z.string()),
      open: bool(),
    }),
  ),
})

// ---------- inner pages ----------

const seo = () => obj({ title: str(), description: str() })
const crumbs = () => list(LinkSchema)
const ctas = () => list(cta())

export const AboutPageSchema = obj({
  seo: seo(),
  hero: obj({
    crumbs: crumbs(),
    tag: str(),
    title: accentTitle(),
    lead: str(),
    /** in-page jump links under the lead */
    links: list(LinkSchema),
    illustration: illustration('building'),
  }),
  stats: obj({
    ariaLabel: str(),
    items: list(
      z.object({ value: str(), caption: str(), style: oneOf(['plain', 'green', 'lime'], 'plain') }),
    ),
  }),
  story: obj({
    head: sectionHead(),
    paragraphs: list(z.string()),
    society: obj({ name: str(), note: str() }),
    timeline: list(z.object({ year: str(), title: str(), body: str() })),
  }),
  coop: obj({
    tag: str(),
    heading: str(),
    points: list(z.object({ title: str(), caption: str() })),
    ctas: ctas(),
    illustration: illustration('family'),
  }),
  leadership: obj({
    head: sectionHead(),
    items: list(z.object({ quote: str(), name: str(), role: str() })),
  }),
  team: obj({ head: sectionHead() }),
  achievements: obj({
    head: sectionHead(),
    accreditation: obj({ tag: str(), title: str() }),
    empanelment: obj({ tag: str(), title: str() }),
    first: obj({ tag: str(), title: str(), body: str() }),
    pacemaker: obj({ title: str() }),
    stat: obj({ value: str(), caption: str() }),
  }),
  careers: obj({ tag: str(), heading: str(), body: str(), ctas: ctas() }),
  nursing: obj({ tag: str(), heading: str(), link: link() }),
})

const centreCard = {
  illustration: illustration('heart'),
  tag: tag(),
  title: str(),
  body: str(),
  link: link(),
}

export const SpecialitiesHubSchema = obj({
  seo: seo(),
  hero: obj({
    crumbs: crumbs(),
    title: accentTitle(),
    lead: str(),
    search: obj({ label: str(), placeholder: str(), buttonLabel: str(), emptyText: str() }),
    chips: list(LinkSchema),
    countLabel: str(),
    illustration: illustration('consult'),
  }),
  steps: list(z.object({ title: str(), hint: str(), href: href() })),
  groups: obj({
    head: sectionHead(),
    /** `{count}` is replaced with the number of departments in the group */
    viewAllLabel: str(),
    moreLabel: str(),
  }),
  centres: obj({ head: sectionHead(), items: list(z.object(centreCard)) }),
  finder: obj({
    eyebrow: str(),
    heading: str(),
    specialityLabel: str(),
    allSpecialities: str(),
    nameLabel: str(),
    namePlaceholder: str(),
    dayLabel: str(),
    anyDay: str(),
    days: list(z.string()),
    buttonLabel: str(),
    resultsLabel: str(),
    emptyText: str(),
  }),
  quickCheck: quickCheck(),
  emergency: obj({ tag: str(), heading: str() }),
})

export const SpecialityGroupPagesSchema = obj({
  pages: list(
    z.object({
      slug: z.string().min(1),
      seo: seo(),
      hero: obj({ title: accentTitle(), lead: str() }),
      count: obj({ label: str(), tone: oneOf(['lime', 'cream', 'sky'], 'lime') }),
      /** small card under the count: the emergency number, a note, or nothing */
      aside: obj({
        kind: oneOf(['emergency', 'info', 'none'], 'none'),
        eyebrow: str(),
        text: str(),
      }),
      emergency: obj({ tag: str(), heading: str(), body: str() }),
      departments: obj({ eyebrow: str(), heading: str(), linkLabel: str() }),
      centres: list(z.object({ ...centreCard, tone: oneOf(['white', 'lavender'], 'white') })),
      camp: obj({
        tag: str(),
        heading: str(),
        body: str(),
        cta: link(),
        illustration: illustration('family'),
      }),
      how: obj({
        eyebrow: str(),
        heading: str(),
        steps: list(z.object({ title: str(), body: str() })),
      }),
      opd: obj({
        eyebrow: str(),
        heading: str(),
        slots: list(z.object({ title: str(), text: str() })),
        bookingTitle: str(),
      }),
      doctors: sectionHead(),
      /** article ids from library.json */
      wellness: obj({ heading: str(), articles: list(z.string()) }),
      quickCheck: quickCheck(),
      cta: obj({ heading: str() }),
    }),
  ),
})

export const LibrarySchema = obj({
  seo: seo(),
  hero: obj({
    crumbs: crumbs(),
    title: accentTitle(),
    lead: str(),
    search: obj({ label: str(), placeholder: str(), buttonLabel: str() }),
    allLabel: str(),
    filterLabel: str(),
  }),
  categories: list(
    z.object({
      key: z.string().min(1),
      label: z.string().min(1),
      tone: oneOf(TAG_TONES, 'green'),
      illustration: illustration(),
      /** colour of the home-page article card */
      accent: oneOf(['red', 'brown', 'purple', 'teal'], 'teal'),
    }),
  ),
  featuredLinkLabel: str(),
  latestHeading: str(),
  emptyText: str(),
  pageSize: z.number().int().positive().catch(9),
  articles: list(ArticleItemSchema),
  quickCheck: quickCheck(),
  askDoctor: obj({ heading: str(), note: str() }),
})

export const NewsPageSchema = obj({
  seo: seo(),
  hero: obj({ crumbs: crumbs(), title: accentTitle(), lead: str() }),
  filters: obj({ ariaLabel: str(), all: str(), news: str(), announcements: str(), tenders: str() }),
  featured: obj({ badge: str(), linkLabel: str() }),
  latest: obj({
    heading: str(),
    pageSize: z.number().int().positive().catch(6),
  }),
  board: obj({
    heading: str(),
    announcementsHeading: str(),
    tendersHeading: str(),
    documentLabel: str(),
  }),
})

export const FacilitiesPageSchema = obj({
  seo: seo(),
  hero: obj({
    crumbs: crumbs(),
    title: accentTitle(),
    lead: str(),
    links: list(LinkSchema),
    illustration: illustration('building'),
  }),
  ambulance: obj({
    tag: str(),
    heading: str(),
    body: str(),
    link: link(),
  }),
  critical: obj({
    head: sectionHead(),
    items: list(z.object({ tone: oneOf(TONES, 'green'), title: str(), body: str(), link: link() })),
  }),
  dialysis: obj({ tag: str(), heading: str(), body: str(), ctas: ctas() }),
  insurance: obj({
    head: sectionHead(),
    steps: list(z.object({ title: str(), body: str() })),
    partnersLabel: str(),
    partners: list(z.string()),
    badge: str(),
  }),
  canteen: obj({
    tag: str(),
    heading: str(),
    body: str(),
    timings: obj({ eyebrow: str(), title: str(), note: str() }),
  }),
  cta: obj({ heading: str(), link: link() }),
})

/** One job opening as the site shows it (from the `careers` collection). */
export const JobItemSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  department: str(),
  type: str(),
  location: str(),
  experience: str(),
  summary: str(),
  body: list(z.string()),
  /** formatted last date to apply; empty when not set */
  date: str(),
  applyLink: str(),
})

export const CareersPageSchema = obj({
  seo: seo(),
  hero: obj({ crumbs: crumbs(), title: accentTitle(), lead: str() }),
  openings: obj({
    eyebrow: str(),
    heading: str(),
    /** `{count}` is replaced with the number of openings */
    countLabel: str(),
    countLabelOne: str(),
    applyLabel: str(),
    detailsLabel: str(),
    /** `{date}` is replaced with the last date */
    lastDateLabel: str(),
    emptyHeading: str(),
    emptyText: str(),
  }),
  cv: obj({ heading: str(), text: str(), buttonLabel: str(), fallbackText: str() }),
})

// ---------- inferred types ----------

export type Image = z.infer<typeof ImageSchema>
export type Link = z.infer<typeof LinkSchema>
export type Tag = z.infer<typeof TagSchema>
export type SiteSettings = z.infer<typeof SiteSettingsSchema>
export type Navigation = z.infer<typeof NavigationSchema>
export type HomePage = z.infer<typeof HomePageSchema>
export type SectionHead = HomePage['centres']['head']
export type Centres = z.infer<typeof CentresSchema>
export type Specialities = z.infer<typeof SpecialitiesSchema>
export type SpecialityGroup = Specialities['groups'][number]
export type Doctors = z.infer<typeof DoctorsSchema>
export type Guide = z.infer<typeof GuideSchema>
export type Facilities = z.infer<typeof FacilitiesSchema>
export type News = z.infer<typeof NewsSchema>
export type Notices = z.infer<typeof NoticesSchema>
export type Blogs = z.infer<typeof BlogsSchema>
export type Faqs = z.infer<typeof FaqsSchema>
export type Cta = z.infer<ReturnType<typeof cta>>
export type AccentTitle = z.infer<ReturnType<typeof accentTitle>>
export type QuickCheck = z.infer<ReturnType<typeof quickCheck>>
export type AboutPage = z.infer<typeof AboutPageSchema>
export type SpecialitiesHub = z.infer<typeof SpecialitiesHubSchema>
export type SpecialityGroupPage = z.infer<typeof SpecialityGroupPagesSchema>['pages'][number]
export type Department = SpecialityGroup['departments'][number]
export type Doctor = Doctors['items'][number]
export type Library = z.infer<typeof LibrarySchema>
export type NewsPage = z.infer<typeof NewsPageSchema>
export type FacilitiesPage = z.infer<typeof FacilitiesPageSchema>
export type NewsItem = z.infer<typeof NewsItemSchema>
export type ArticleItem = z.infer<typeof ArticleItemSchema>
export type JobItem = z.infer<typeof JobItemSchema>
export type CareersPage = z.infer<typeof CareersPageSchema>
