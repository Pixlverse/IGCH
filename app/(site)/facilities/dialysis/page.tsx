import { buildServiceMetadata, ServicePageView } from '@/components/page/ServicePageView'

export const generateMetadata = () => buildServiceMetadata('dialysis')

export default function Page() {
  return <ServicePageView pageKey="dialysis" />
}
