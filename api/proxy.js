import http from 'node:http'

const BACKEND_URL =
  process.env.BACKEND_API_URL ||
  'http://salonapplication1-env.eba-3v3fhukb.ap-south-1.elasticbeanstalk.com'

/**
 * Extracts target path & query string from either:
 * 1. req.query (when rewritten via /api/:path* -> /api/proxy?path=:path*)
 * 2. req.url (raw request URL)
 */
function getTargetPathAndQuery(req) {
  const rawUrl = req.url || '/api'
  const parsed = new URL(rawUrl, 'http://localhost')
  const pathParam = (req.query && req.query.path) || parsed.searchParams.get('path')

  let targetPath = ''
  if (pathParam) {
    const rawPath = Array.isArray(pathParam) ? pathParam.join('/') : pathParam
    targetPath = '/api/' + String(rawPath).replace(/^\/+/, '')
  } else {
    targetPath = parsed.pathname
    if (targetPath === '/api/proxy' || targetPath === '/api/index') {
      targetPath = '/api'
    }
  }

  const searchParams = new URLSearchParams()
  if (req.query) {
    for (const [key, val] of Object.entries(req.query)) {
      if (key !== 'path') {
        if (Array.isArray(val)) {
          val.forEach((v) => searchParams.append(key, v))
        } else if (val !== undefined && val !== null) {
          searchParams.append(key, val)
        }
      }
    }
  }
  parsed.searchParams.forEach((val, key) => {
    if (key !== 'path' && !searchParams.has(key)) {
      searchParams.append(key, val)
    }
  })

  const qs = searchParams.toString()
  return targetPath + (qs ? `?${qs}` : '')
}

/**
 * Safely extracts request body buffer, supporting both pre-parsed
 * Vercel bodies (JSON objects) and raw incoming streams.
 */
async function getRequestBody(req) {
  if (req.body !== undefined && req.body !== null) {
    if (typeof req.body === 'object' && !Buffer.isBuffer(req.body)) {
      return Buffer.from(JSON.stringify(req.body))
    }
    return Buffer.isBuffer(req.body) ? req.body : Buffer.from(String(req.body))
  }
  return new Promise((resolve, reject) => {
    const chunks = []
    req.on('data', (chunk) => chunks.push(chunk))
    req.on('end', () => {
      resolve(chunks.length > 0 ? Buffer.concat(chunks) : null)
    })
    req.on('error', reject)
  })
}

export default async function handler(req, res) {
  // Handle CORS preflight if triggered
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': req.headers.origin || '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS, HEAD',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With, Accept',
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Max-Age': '86400',
    })
    return res.end()
  }

  try {
    const targetPathAndQuery = getTargetPathAndQuery(req)
    const backendUrl = new URL(targetPathAndQuery, BACKEND_URL)
    const bodyData = await getRequestBody(req)

    const hopByHopHeaders = new Set([
      'connection',
      'keep-alive',
      'proxy-authenticate',
      'proxy-authorization',
      'te',
      'trailer',
      'transfer-encoding',
      'upgrade',
      'host',
      'content-length',
      'origin',
      'referer',
    ])

    const forwardHeaders = {}
    for (const [key, value] of Object.entries(req.headers)) {
      const lowerKey = key.toLowerCase()
      if (!hopByHopHeaders.has(lowerKey)) {
        forwardHeaders[lowerKey] = value
      }
    }

    if (bodyData) {
      forwardHeaders['content-length'] = bodyData.length
    }

    const proxyReq = http.request(
      backendUrl,
      {
        method: req.method,
        headers: forwardHeaders,
        timeout: 25000,
      },
      (proxyRes) => {
        const responseHeaders = {}
        for (const [key, value] of Object.entries(proxyRes.headers)) {
          const lowerKey = key.toLowerCase()
          if (!hopByHopHeaders.has(lowerKey)) {
            responseHeaders[key] = value
          }
        }

        // Attach CORS response headers so any browser client or Vercel preview domain is permitted
        const clientOrigin = req.headers.origin
        if (clientOrigin) {
          responseHeaders['access-control-allow-origin'] = clientOrigin
          responseHeaders['access-control-allow-credentials'] = 'true'
          responseHeaders['access-control-allow-methods'] = 'GET, POST, PUT, PATCH, DELETE, OPTIONS, HEAD'
          responseHeaders['access-control-allow-headers'] = 'Content-Type, Authorization, X-Requested-With, Accept'
        }

        res.writeHead(proxyRes.statusCode || 200, responseHeaders)
        proxyRes.pipe(res)
      }
    )

    proxyReq.on('timeout', () => {
      proxyReq.destroy(new Error('Backend timeout'))
      if (!res.headersSent) {
        res.writeHead(504, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ success: false, message: 'Backend request timed out' }))
      }
    })

    proxyReq.on('error', (err) => {
      if (!res.headersSent) {
        res.writeHead(502, { 'Content-Type': 'application/json' })
        res.end(
          JSON.stringify({
            success: false,
            message: 'Bad Gateway: unable to communicate with backend server',
            error: err.message,
          })
        )
      }
    })

    if (bodyData) {
      proxyReq.write(bodyData)
    }
    proxyReq.end()
  } catch (err) {
    if (!res.headersSent) {
      res.writeHead(500, { 'Content-Type': 'application/json' })
      res.end(
        JSON.stringify({
          success: false,
          message: 'Internal proxy error',
          error: err instanceof Error ? err.message : String(err),
        })
      )
    }
  }
}
