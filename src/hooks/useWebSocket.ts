import { useEffect, useRef } from 'react'
import { Client } from '@stomp/stompjs'
import { store } from '../app/store'
import { addNotification } from '../features/notification/notificationSlice'

/**
 * useWebSocket — connects to the Spring Boot STOMP endpoint.
 * Uses @stomp/stompjs' built-in WebSocket (not SockJS) to avoid the
 * `global is not defined` browser error with sockjs-client.
 *
 * The backend WebSocket endpoint is proxied via Vite at /ws.
 */
export const useWebSocket = () => {
  const clientRef = useRef<Client | null>(null)
  const token = store.getState().auth.token

  useEffect(() => {
    const { user } = store.getState().auth
    if (!token || !user) return

    const configuredWsBase = (import.meta.env.VITE_WS_URL || '').replace(/\/$/, '')
    const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws'
    const wsUrl = configuredWsBase
      ? `${configuredWsBase}/ws/websocket`
      : `${protocol}://${window.location.host}/ws/websocket`

    const client = new Client({
      brokerURL: wsUrl,
      connectHeaders: { Authorization: `Bearer ${token}` },
      reconnectDelay: 5000,
      onConnect: () => {
        console.info('[WS] Connected to STOMP broker')
        client.subscribe(`/user/${user.email}/queue/bookings`, (message) => {
          store.dispatch(addNotification({
            id: Date.now(),
            title: 'Booking Update',
            message: message.body,
            type: 'BOOKING_CREATED',
            isRead: false,
            createdAt: new Date().toISOString(),
          }))
        })
      },
      onStompError: (frame) => {
        console.warn('[WS] STOMP error:', frame.headers?.['message'])
      },
      onWebSocketError: () => {
        // Gracefully ignore connection attempts when backend server is offline
      },
      onDisconnect: () => {
        console.info('[WS] Disconnected')
      },
    })

    client.activate()
    clientRef.current = client

    return () => {
      client.deactivate()
    }
    // Re-run if auth state changes (login/logout)
  }, [token])

  return clientRef
}
