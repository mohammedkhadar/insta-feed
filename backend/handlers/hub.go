package handlers

import (
	"sync"

	"github.com/gorilla/websocket"
)

var hub = &Hub{
	clients: make(map[*websocket.Conn]bool),
}

type Hub struct {
	mu      sync.Mutex
	clients map[*websocket.Conn]bool
}

func (h *Hub) register(conn *websocket.Conn) {
	h.mu.Lock()
	defer h.mu.Unlock()
	h.clients[conn] = true
}

func (h *Hub) unregister(conn *websocket.Conn) {
	h.mu.Lock()
	defer h.mu.Unlock()
	delete(h.clients, conn)
	conn.Close()
}

func (h *Hub) Broadcast(msg []byte) {
	h.mu.Lock()
	defer h.mu.Unlock()
	for conn := range h.clients {
		conn.WriteMessage(websocket.TextMessage, msg)
	}
}
