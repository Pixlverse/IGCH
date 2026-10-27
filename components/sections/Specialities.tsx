import { SectionHead } from '@/components/ui/SectionHead'
import type {
  HomePage,
  SiteSettings,
  Specialities as SpecialitiesContent,
} from '@/lib/content/schemas'

import { SpecialitiesExplorer } from './SpecialitiesExplorer'

type Props = {
  copy: HomePage['specialities']
  specialities: SpecialitiesContent
  site: SiteSettings
}

export function Specialities({ copy, specialities, site }: Props) {
  return (
    <section className="section" id="specialities">
      <SectionHead head={copy.head} />
      <SpecialitiesExplorer groups={specialities.groups} copy={copy} phone={site.emergency.phone} />
    </section>
  )
}
