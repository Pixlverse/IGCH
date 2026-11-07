import { buildServiceMetadata, ServicePageView } from '@/components/page/ServicePageView'

export const generateMetadata = () => buildServiceMetadata('canteen')

export default function Page() {
  return <ServicePageView pageKey="canteen" />
}
