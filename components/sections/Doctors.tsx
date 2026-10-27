import { SectionHead } from '@/components/ui/SectionHead'
import type { Doctors as DoctorsContent, SectionHead as Head } from '@/lib/content/schemas'

import { DoctorCard } from './DoctorCard'

export function Doctors({
  head,
  doctors,
  id = 'doctors',
}: {
  head: Head
  doctors: DoctorsContent
  id?: string
}) {
  if (doctors.items.length === 0) return null
  return (
    <section className="section" id={id}>
      <SectionHead head={head} />
      <div className="doctors" data-reveal="">
        {doctors.items.map((doctor, i) => (
          <DoctorCard key={`${doctor.name}-${i}`} doctor={doctor} index={i} />
        ))}
      </div>
    </section>
  )
}
