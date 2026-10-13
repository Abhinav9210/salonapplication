import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const rawTarget = env.VITE_API_BASE_URL || 'http://127.0.0.1:8085'
  const backendTarget = rawTarget.replace('localhost', '127.0.0.1')

  const handleProxyError = (proxyType: string) => (err: unknown) => {
    // Gracefully handle expected offline / disconnection errors without noisy terminal spam
    const error = err as {
      message?: string
      code?: string
      name?: string
      errors?: Array<{ code?: string }>
    }
    const msg = error?.message || String(err || '')
    const code = error?.code || (error?.errors && error.errors[0]?.code)
    const isIgnorable =
      code === 'ECONNREFUSED' ||
      code === 'ECONNRESET' ||
      code === 'EPIPE' ||
      msg.includes('ECONNREFUSED') ||
      msg.includes('ECONNRESET') ||
      msg.includes('EPIPE') ||
      error?.name === 'AggregateError'
    if (!isIgnorable) {
      console.warn(`[vite] ${proxyType} proxy error:`, msg)
    }
  }

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    // Polyfill Node's `global` for sockjs-client in the browser
    define: {
      global: 'globalThis',
    },
    optimizeDeps: {
      include: ['sockjs-client', '@stomp/stompjs'],
    },
    server: {
      port: 5173,
      proxy: {
        '/api': {
          target: backendTarget,
          changeOrigin: true,
          configure: (proxy) => {
            proxy.on('error', handleProxyError('api'))
          },
        },
        '/ws': {
          target: backendTarget,
          ws: true,
          changeOrigin: true,
          configure: (proxy) => {
            proxy.on('error', handleProxyError('ws'))
          },
        },
      },
    },
  }
})
