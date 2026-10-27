import { Button } from '@/components/ui/Button'
import { ContentImage } from '@/components/ui/ContentImage'
import { Tag } from '@/components/ui/Tag'
import type { HomePage } from '@/lib/content/schemas'

export function Coop({ coop }: { coop: HomePage['coop'] }) {
  return (
    <section className="section">
      <div className="coop" data-reveal="">
        <div className="coop__body">
          <Tag {...coop.tag} />
          <h2>
            {coop.heading.main} <em>{coop.heading.emphasis}</em>
          </h2>
          <p>{coop.body}</p>
          {coop.points.length > 0 && (
            <div className="coop__points">
              {coop.points.map((point) => (
                <div key={point.title}>
                  <strong>{point.title}</strong>
                  <span>{point.caption}</span>
                </div>
              ))}
            </div>
          )}
          {coop.ctas.length > 0 && (
            <div className="coop__ctas">
              {coop.ctas.map((cta) => (
                <Button key={cta.label} href={cta.href} variant={cta.style}>
                  {cta.label}
                </Button>
              ))}
            </div>
          )}
        </div>
        <div className="coop__art">
          <ContentImage
            image={coop.image}
            sizes="(max-width: 960px) 100vw, (min-width: 1560px) 600px, 40vw"
          />
        </div>
      </div>
    </section>
  )
}
