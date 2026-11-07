import { buildServiceMetadata, ServicePageView } from '@/components/page/ServicePageView'

export const generateMetadata = () => buildServiceMetadata('karunya')

export default function Page() {
  return <ServicePageView pageKey="karunya" />
}
