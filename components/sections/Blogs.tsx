import clsx from 'clsx'

import { SectionHead } from '@/components/ui/SectionHead'
import { SmartLink } from '@/components/ui/SmartLink'
import { Tag } from '@/components/ui/Tag'
import type { Blogs as BlogsContent, SectionHead as Head } from '@/lib/content/schemas'

export function Blogs({ head, blogs }: { head: Head; blogs: BlogsContent }) {
  if (blogs.items.length === 0) return null
  return (
    <section className="section" id="blogs">
      <SectionHead head={head} />
      <div className="blogs" data-reveal="">
        {blogs.items.map((post) => (
          <SmartLink
            key={post.title}
            href={post.href}
            className={clsx('blog', `blog--${post.accent}`)}
          >
            <span>
              <Tag {...post.category} />
            </span>
            <h3>{post.title}</h3>
            <small>{post.meta}</small>
          </SmartLink>
        ))}
      </div>
    </section>
  )
}
