import type { Faqs, HomePage } from '@/lib/content/schemas'

/** Native exclusive accordion (<details name>), no JavaScript, as in the original. */
export function Faq({ copy, faqs }: { copy: HomePage['faq']; faqs: Faqs }) {
  if (faqs.items.length === 0) return null
  return (
    <section className="section">
      <div className="faq" data-reveal="">
        <div>
          {copy.tag && <span className="tag">{copy.tag}</span>}
          <h2>{copy.heading}</h2>
        </div>
        <div className="faq__list">
          {faqs.items.map((item) => (
            <details key={item.question} name="faq" open={item.open || undefined}>
              <summary>{item.question}</summary>
              {item.answer.map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}
