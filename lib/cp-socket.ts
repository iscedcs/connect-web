import { io, Socket } from 'socket.io-client'
import { useCpWorkspaceStore } from '@/stores/cp-workspace.store'

let socket: Socket | null = null

export function getCpSocket(): Socket {
  if (!socket) {
    const wsId = useCpWorkspaceStore.getState().workspaceId
    socket = io(`${process.env.NEXT_PUBLIC_CONNECT_API_URL}/cp`, {
      withCredentials: true,
      autoConnect: false,
      query: { workspaceId: wsId },
    })
  }
  return socket
}

export function disconnectCpSocket() {
  if (socket?.connected) {
    socket.disconnect()
  }
  socket = null
}
