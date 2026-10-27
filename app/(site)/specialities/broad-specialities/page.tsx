import { buildGroupMetadata, GroupView } from '@/components/specialities/GroupView'

const SLUG = 'broad-specialities'

export const generateMetadata = () => buildGroupMetadata(SLUG)

export default function Page() {
  return <GroupView slug={SLUG} />
}
