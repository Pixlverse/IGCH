/**
 * Profile text from the admin: each block is a paragraph, a bulleted list
 * (lines starting with "- "), or a lead-in line followed by bullets, which
 * becomes a small heading above the list.
 */
export function RichBlocks({ blocks }: { blocks: string[] }) {
  return blocks.map((block, i) => {
    const lines = block
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
    const bullets = lines.filter((line) => line.startsWith('- ')).map((line) => line.slice(2))
    const text = lines.filter((line) => !line.startsWith('- ')).join(' ')
    if (bullets.length === 0) return <p key={i}>{text}</p>
    return (
      <div key={i} className="rich-list">
        {text && <p className="rich-list__lead">{text}</p>}
        <ul>
          {bullets.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
    )
  })
}
