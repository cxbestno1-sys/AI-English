const http = require('http')

const PORT = 3001

const server = http.createServer((req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    res.writeHead(204)
    res.end()
    return
  }

  if (req.method !== 'POST' || req.url !== '/proxy') {
    res.writeHead(404)
    res.end('Not found')
    return
  }

  let body = ''
  req.on('data', chunk => { body += chunk })
  req.on('end', async () => {
    try {
      const { target, headers, body: requestBody } = JSON.parse(body)
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 30000)

      const response = await fetch(target, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...headers },
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      })
      clearTimeout(timeout)

      const contentType = response.headers.get('content-type') || ''
      const isBinary = contentType.includes('audio') || contentType.includes('octet-stream')

      if (isBinary) {
        const arrayBuffer = await response.arrayBuffer()
        res.writeHead(response.status, {
          'Content-Type': contentType,
          'Content-Length': arrayBuffer.byteLength.toString(),
        })
        res.end(Buffer.from(arrayBuffer))
      } else {
        const text = await response.text()
        res.writeHead(response.status, { 'Content-Type': 'application/json' })
        res.end(text)
      }
    } catch (e) {
      res.writeHead(500, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ error: e.message || 'Proxy error' }))
    }
  })
})

server.listen(PORT, () => {
  console.log(`Proxy server running on http://127.0.0.1:${PORT}`)
})
