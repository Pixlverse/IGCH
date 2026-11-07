import { buildServiceMetadata, ServicePageView } from '@/components/page/ServicePageView'

export const generateMetadata = () => buildServiceMetadata('insurance')

export default function Page() {
  return <ServicePageView pageKey="insurance" />
}
