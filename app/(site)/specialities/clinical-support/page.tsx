import { buildGroupMetadata, GroupView } from '@/components/specialities/GroupView'

const SLUG = 'clinical-support'

export const generateMetadata = () => buildGroupMetadata(SLUG)

export default function Page() {
  return <GroupView slug={SLUG} />
}
