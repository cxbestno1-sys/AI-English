import http from 'http'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DIST = path.join(__dirname, 'dist')
const PORT = 5173

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
}

function serveStatic(req, res) {
  const urlPath = req.url === '/' ? '/index.html' : req.url
  const filePath = path.join(DIST, urlPath)
  const ext = path.extname(filePath)

  fs.readFile(filePath, (err, data) => {
    if (err) {
      fs.readFile(path.join(DIST, 'index.html'), (err2, data2) => {
        if (err2) {
          res.writeHead(500)
          res.end('Internal error')
          return
        }
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
        res.end(data2)
      })
      return
    }
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' })
    res.end(data)
  })
}

// --- Proxy helpers ---
function readBody(req) {
  return new Promise((resolve) => {
    let raw = ''
    req.on('data', chunk => { raw += chunk })
    req.on('end', () => resolve(raw))
  })
}

async function forwardToUpstream(res, target, authHeaders, requestBody, { contentType = 'application/json' } = {}) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 120000)

  const upstream = await fetch(target, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders },
    body: JSON.stringify(requestBody),
    signal: controller.signal,
  })
  clearTimeout(timeout)

  const ct = upstream.headers.get('content-type') || contentType

  // Binary: pipe as-is
  const isBinary = ct.includes('audio') || ct.includes('octet-stream')
  if (isBinary) {
    const buf = await upstream.arrayBuffer()
    res.writeHead(upstream.status, { 'Content-Type': ct, 'Content-Length': buf.byteLength.toString() })
    res.end(Buffer.from(buf))
    return
  }

  // Text: return verbatim
  const text = await upstream.text()
  res.writeHead(upstream.status, { 'Content-Type': 'application/json' })
  res.end(text)
}

// --- Separate chat proxy ---
async function handleChatProxy(req, res) {
  const raw = await readBody(req)
  try {
    const { target, headers, body } = JSON.parse(raw)
    await forwardToUpstream(res, target, headers, body, { contentType: 'application/json' })
  } catch (e) {
    res.writeHead(400, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ error: e.message || 'Invalid chat proxy request' }))
  }
}

// --- Separate TTS proxy ---
async function handleTTSProxy(req, res) {
  const raw = await readBody(req)
  try {
    const { target, headers, body } = JSON.parse(raw)
    await forwardToUpstream(res, target, headers, body, { contentType: 'audio/wav' })
  } catch (e) {
    res.writeHead(400, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ error: e.message || 'Invalid TTS proxy request' }))
  }
}

// Keep the old /api/llm-proxy for backward compatibility
async function handleLegacyProxy(req, res) {
  const raw = await readBody(req)
  try {
    const { target, headers, body } = JSON.parse(raw)
    // Guess: if body has "input" field, treat as TTS
    const isTTS = body && body.input !== undefined
    await forwardToUpstream(res, target, headers, body, { contentType: isTTS ? 'audio/wav' : 'application/json' })
  } catch (e) {
    res.writeHead(400, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ error: e.message || 'Invalid proxy request' }))
  }
}

// --- Error handlers ---
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT:', err.message)
})
process.on('unhandledRejection', (reason) => {
  console.error('UNHANDLED:', reason)
})

// --- Server ---
const server = http.createServer(async (req, res) => {
  try {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

    if (req.method === 'OPTIONS') {
      res.writeHead(204)
      res.end()
      return
    }

    if (req.method === 'POST') {
      if (req.url === '/api/chat-proxy') return handleChatProxy(req, res)
      if (req.url === '/api/tts-proxy')  return handleTTSProxy(req, res)
      if (req.url === '/api/llm-proxy')  return handleLegacyProxy(req, res)
    }

    serveStatic(req, res)
  } catch (e) {
    try { res.writeHead(500); res.end() } catch {}
  }
})

server.on('listening', () => {
  console.log(`SpeakNow server running on http://localhost:${PORT}`)
})
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} in use, retrying in 2s...`)
    setTimeout(() => {
      server.close()
      server.listen(PORT, '0.0.0.0')
    }, 2000)
  }
})

server.listen(PORT, '0.0.0.0')
