import { ContentImage } from '@/components/ui/ContentImage'
import { Initials } from '@/components/ui/Initials'
import { SmartLink } from '@/components/ui/SmartLink'
import type { Doctor } from '@/lib/content/schemas'

const SIZES = '(max-width: 640px) 100vw, (max-width: 960px) 50vw, (min-width: 1560px) 370px, 24vw'

/** Doctor card; shows the doctor's initials until a photo is supplied. */
export function DoctorCard({ doctor }: { doctor: Doctor }) {
  return (
    <SmartLink href={doctor.href} className="doctor">
      <div className="doctor__art">
        {doctor.image ? (
          <ContentImage image={doctor.image} sizes={SIZES} />
        ) : (
          <Initials name={doctor.name} />
        )}
      </div>
      <h3>{doctor.name}</h3>
      {doctor.department && <span className="doctor__dept">{doctor.department}</span>}
      {doctor.qualifications && <p>{doctor.qualifications}</p>}
    </SmartLink>
  )
}
