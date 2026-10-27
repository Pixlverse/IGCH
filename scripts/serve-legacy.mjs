// Minimal static server for the untouched original site in /legacy (visual-diff baseline).
import { createReadStream, statSync } from 'node:fs'
import { createServer } from 'node:http'
import { extname, join, normalize, resolve } from 'node:path'

const root = resolve(process.cwd(), 'legacy')
const port = Number(process.env.LEGACY_PORT || 4100)
const types = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
}

createServer((req, res) => {
  const url = new URL(req.url ?? '/', 'http://localhost')
  let path = normalize(join(root, decodeURIComponent(url.pathname)))
  if (!path.startsWith(root)) return res.writeHead(403).end()
  try {
    if (statSync(path).isDirectory()) path = join(path, 'index.html')
    res.writeHead(200, { 'content-type': types[extname(path)] ?? 'application/octet-stream' })
    createReadStream(path).pipe(res)
  } catch {
    res.writeHead(404).end('Not found')
  }
}).listen(port, () => console.log(`legacy site on http://localhost:${port}`))
