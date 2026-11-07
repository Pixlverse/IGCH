import { buildServiceMetadata, ServicePageView } from '@/components/page/ServicePageView'

export const generateMetadata = () => buildServiceMetadata('nursingCollege')

export default function Page() {
  return <ServicePageView pageKey="nursingCollege" />
}
